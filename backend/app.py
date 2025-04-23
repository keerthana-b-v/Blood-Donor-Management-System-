from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import jwt
import datetime
import bcrypt
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/blood_donor_system"
mongo = PyMongo(app)

# JWT Secret Key
app.config['SECRET_KEY'] = 'your_secret_key'  # Change this in production

# Collections - Using separate collections for donors and recipients
donors = mongo.db.donors
recipients = mongo.db.recipients
donations = mongo.db.donations
admins = mongo.db.admins

# Helper function to convert MongoDB ObjectId to string
def parse_json(data):
    if isinstance(data, list):
        return [{**item, '_id': str(item['_id'])} for item in data]
    return {**data, '_id': str(data['_id'])}

# Token required decorator - simplified version
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # For development, allow requests without a token
        if not token:
            print("Warning: Request without token")
            current_user = {"username": "admin"}  # Dummy user
            return f(current_user, *args, **kwargs)
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = admins.find_one({'username': data['username']})
            if not current_user:
                current_user = {"username": "admin"}  # Fallback to dummy user
        except:
            print("Warning: Invalid token")
            current_user = {"username": "admin"}  # Fallback to dummy user
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Initialize admin user
@app.route('/api/init', methods=['GET'])
def init_app():
    if not admins.find_one({'username': 'admin'}):
        hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
        admins.insert_one({
            'username': 'admin',
            'password': hashed_password
        })
        return jsonify({"message": "Admin user created"})
    return jsonify({"message": "Admin already exists"})

@app.before_request
def create_admin_before_request():
    if request.endpoint != 'init_app':  # Avoid infinite recursion
        try:
            if not admins.find_one({'username': 'admin'}):
                hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
                admins.insert_one({
                    'username': 'admin',
                    'password': hashed_password
                })
                print("Admin user created")
        except Exception as e:
            print(f"Error creating admin: {e}")

# Helper function to replace null values with "NO Field"
def replace_nulls_with_no_field(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if value is None:
                data[key] = "NO Field"
            elif isinstance(value, (dict, list)):
                replace_nulls_with_no_field(value)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if item is None:
                data[i] = "NO Field"
            elif isinstance(item, (dict, list)):
                replace_nulls_with_no_field(item)
    return data

# Helper function to replace empty strings with "NO Field"
def process_input_data(data):
    if isinstance(data, dict):
        for key, value in list(data.items()):
            if value == "" or value is None:
                data[key] = "NO Field"
            elif isinstance(value, (dict, list)):
                process_input_data(value)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if item == "" or item is None:
                data[i] = "NO Field"
            elif isinstance(item, (dict, list)):
                process_input_data(item)
    return data

# Routes
@app.route('/api/admin/login', methods=['POST'])
def login():
    # Always create a valid token without checking credentials
    token = jwt.encode({
        'username': 'admin',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }, app.config['SECRET_KEY'])
    
    return jsonify({'token': token})

# Dashboard data
@app.route('/api/dashboard', methods=['GET'])
@token_required
def get_dashboard(current_user):
    total_donors = donors.count_documents({})
    total_recipients = recipients.count_documents({})
    pending_donations = donations.count_documents({'status': 'Pending'})
    completed_donations = donations.count_documents({'status': 'Completed'})
    urgent_requests = recipients.count_documents({'urgencyLevel': 'High'})
    
    return jsonify({
        'totalDonors': total_donors,
        'totalRecipients': total_recipients,
        'pendingDonations': pending_donations,
        'completedDonations': completed_donations,
        'urgentRequests': urgent_requests
    })

# Donor routes
@app.route('/api/donors', methods=['GET'])
@token_required
def get_donors(current_user):
    result = list(donors.find())
    # Replace null values with "NO Field" before sending response
    result = replace_nulls_with_no_field(result)
    return jsonify(parse_json(result))

@app.route('/api/donors/<id>', methods=['GET'])
@token_required
def get_donor(current_user, id):
    donor = donors.find_one({'_id': ObjectId(id)})
    if not donor:
        return jsonify({'message': 'Donor not found'}), 404
    # Replace null values with "NO Field" before sending response
    donor = replace_nulls_with_no_field(donor)
    return jsonify(parse_json(donor))

@app.route('/api/donors', methods=['POST'])
@token_required
def add_donor(current_user):
    try:
        data = request.get_json()
        
        # Print received data for debugging
        print("Received donor data:", data)
        
        # Only validate name and blood group as required
        if 'name' not in data or not data['name']:
            return jsonify({'message': 'Name is required'}), 400
            
        if 'bloodGroup' not in data or not data['bloodGroup']:
            return jsonify({'message': 'Blood Group is required'}), 400
        
        if 'phone' not in data or not data['phone']:
            return jsonify({'message': 'Phone Number is required'}), 400
        
        # Set default values only if not provided
        if 'available' not in data:
            data['available'] = True
        
        # Convert age to integer only if it's provided and is a string
        if 'age' in data and data['age'] and isinstance(data['age'], str) and data['age'] != "NO Field":
            try:
                data['age'] = int(data['age'])
            except ValueError:
                # If conversion fails, keep it as is
                pass
        
        # Add donation history as embedded array only if not provided
        if 'donationHistory' not in data:
            data['donationHistory'] = []
        
        # Replace empty strings and null values with "NO Field"
        data = process_input_data(data)
        
        donor_id = donors.insert_one(data).inserted_id
        return jsonify({'message': 'Donor added successfully', 'id': str(donor_id)}), 201
    except Exception as e:
        print(f"Error adding donor: {e}")
        return jsonify({'message': f'Error adding donor: {str(e)}'}), 500

# Update the donor update route to handle null values properly and exclude _id
@app.route('/api/donors/<id>', methods=['PUT'])
@token_required
def update_donor(current_user, id):
    try:
        data = request.get_json()
        
        # Check if donor exists
        if not donors.find_one({'_id': ObjectId(id)}):
            return jsonify({'message': 'Donor not found'}), 404
        
        # Remove _id field if present to avoid immutable field error
        if '_id' in data:
            del data['_id']
        
        # Replace empty strings and null values with "NO Field"
        data = process_input_data(data)
        
        # Print the data being updated for debugging
        print(f"Updating donor {id} with data: {data}")
        
        # Update the donor
        result = donors.update_one({'_id': ObjectId(id)}, {'$set': data})
        
        if result.modified_count == 0:
            return jsonify({'message': 'No changes made to donor'}), 200
            
        return jsonify({'message': 'Donor updated successfully'})
    except Exception as e:
        print(f"Error updating donor: {e}")
        return jsonify({'message': f'Error updating donor: {str(e)}'}), 500

@app.route('/api/donors/<id>', methods=['DELETE'])
@token_required
def delete_donor(current_user, id):
    try:
        result = donors.delete_one({'_id': ObjectId(id)})
        
        if result.deleted_count == 0:
            return jsonify({'message': 'Donor not found'}), 404
        
        return jsonify({'message': 'Donor deleted successfully'})
    except Exception as e:
        print(f"Error deleting donor: {e}")
        return jsonify({'message': f'Error deleting donor: {str(e)}'}), 500

@app.route('/api/donors/search', methods=['GET'])
@token_required
def search_donors(current_user):
    try:
        query = {}
        
        if 'bloodGroup' in request.args:
            query['bloodGroup'] = request.args.get('bloodGroup')
        
        if 'location' in request.args:
            query['location'] = {'$regex': request.args.get('location'), '$options': 'i'}
        
        # NoSQL advantage - flexible querying
        if 'minAge' in request.args:
            if 'age' not in query:
                query['age'] = {}
            query['age']['$gte'] = int(request.args.get('minAge'))
        
        if 'maxAge' in request.args:
            if 'age' not in query:
                query['age'] = {}
            query['age']['$lte'] = int(request.args.get('maxAge'))
        
        result = list(donors.find(query))
        # Replace null values with "NO Field" before sending response
        result = replace_nulls_with_no_field(result)
        return jsonify(parse_json(result))
    except Exception as e:
        print(f"Error searching donors: {e}")
        return jsonify({'message': f'Error searching donors: {str(e)}'}), 500

# Recipient routes
@app.route('/api/recipients', methods=['GET'])
@token_required
def get_recipients(current_user):
    result = list(recipients.find())
    # Replace null values with "NO Field" before sending response
    result = replace_nulls_with_no_field(result)
    return jsonify(parse_json(result))

@app.route('/api/recipients/<id>', methods=['GET'])
@token_required
def get_recipient(current_user, id):
    recipient = recipients.find_one({'_id': ObjectId(id)})
    if not recipient:
        return jsonify({'message': 'Recipient not found'}), 404
    # Replace null values with "NO Field" before sending response
    recipient = replace_nulls_with_no_field(recipient)
    return jsonify(parse_json(recipient))

@app.route('/api/recipients', methods=['POST'])
@token_required
def add_recipient(current_user):
    try:
        data = request.get_json()
        
        # Only validate name and blood group as required
        if 'name' not in data or not data['name']:
            return jsonify({'message': 'Name is required'}), 400
            
        if 'bloodGroup' not in data or not data['bloodGroup']:
            return jsonify({'message': 'Blood Group is required'}), 400
        
        if 'contactNumber' not in data or not data['contactNumber']:
            return jsonify({'message': 'Contact Number is required'}), 400
        
        # Replace empty strings and null values with "NO Field"
        data = process_input_data(data)
        
        recipient_id = recipients.insert_one(data).inserted_id
        return jsonify({'message': 'Recipient added successfully', 'id': str(recipient_id)}), 201
    except Exception as e:
        print(f"Error adding recipient: {e}")
        return jsonify({'message': f'Error adding recipient: {str(e)}'}), 500

# Update the recipient update route to handle null values properly and exclude _id
@app.route('/api/recipients/<id>', methods=['PUT'])
@token_required
def update_recipient(current_user, id):
    try:
        data = request.get_json()
        
        # Check if recipient exists
        if not recipients.find_one({'_id': ObjectId(id)}):
            return jsonify({'message': 'Recipient not found'}), 404
        
        # Remove _id field if present to avoid immutable field error
        if '_id' in data:
            del data['_id']
        
        # Replace empty strings and null values with "NO Field"
        data = process_input_data(data)
        
        # Print the data being updated for debugging
        print(f"Updating recipient {id} with data: {data}")
        
        # Update the recipient
        result = recipients.update_one({'_id': ObjectId(id)}, {'$set': data})
        
        if result.modified_count == 0:
            return jsonify({'message': 'No changes made to recipient'}), 200
            
        return jsonify({'message': 'Recipient updated successfully'})
    except Exception as e:
        print(f"Error updating recipient: {e}")
        return jsonify({'message': f'Error updating recipient: {str(e)}'}), 500

@app.route('/api/recipients/<id>', methods=['DELETE'])
@token_required
def delete_recipient(current_user, id):
    try:
        result = recipients.delete_one({'_id': ObjectId(id)})
        
        if result.deleted_count == 0:
            return jsonify({'message': 'Recipient not found'}), 404
        
        return jsonify({'message': 'Recipient deleted successfully'})
    except Exception as e:
        print(f"Error deleting recipient: {e}")
        return jsonify({'message': f'Error deleting recipient: {str(e)}'}), 500

@app.route('/api/recipients/search', methods=['GET'])
@token_required
def search_recipients(current_user):
    try:
        query = {}
        
        if 'bloodGroup' in request.args:
            query['bloodGroup'] = request.args.get('bloodGroup')
        
        if 'location' in request.args:
            query['location'] = {'$regex': request.args.get('location'), '$options': 'i'}
        
        if 'urgencyLevel' in request.args:
            query['urgencyLevel'] = request.args.get('urgencyLevel')
        
        # NoSQL advantage - date range queries
        if 'dateNeededFrom' in request.args:
            if 'dateNeeded' not in query:
                query['dateNeeded'] = {}
            query['dateNeeded']['$gte'] = request.args.get('dateNeededFrom')
        
        if 'dateNeededTo' in request.args:
            if 'dateNeeded' not in query:
                query['dateNeeded'] = {}
            query['dateNeeded']['$lte'] = request.args.get('dateNeededTo')
        
        result = list(recipients.find(query))
        # Replace null values with "NO Field" before sending response
        result = replace_nulls_with_no_field(result)
        return jsonify(parse_json(result))
    except Exception as e:
        print(f"Error searching recipients: {e}")
        return jsonify({'message': f'Error searching recipients: {str(e)}'}), 500

# Matching routes
@app.route('/api/match', methods=['GET'])
@token_required
def match_all(current_user):
    try:
        all_recipients_list = list(recipients.find())
        all_matches = {}
        
        for recipient in all_recipients_list:
            recipient_id = str(recipient['_id'])
            matches = find_matching_donors(recipient)
            all_matches[recipient_id] = parse_json(matches)
        
        # Replace null values with "NO Field" before sending response
        all_matches = replace_nulls_with_no_field(all_matches)
        return jsonify(all_matches)
    except Exception as e:
        print(f"Error matching all: {e}")
        return jsonify({'message': f'Error matching all: {str(e)}'}), 500

@app.route('/api/match/<recipient_id>', methods=['GET'])
@token_required
def match_recipient(current_user, recipient_id):
    try:
        recipient = recipients.find_one({'_id': ObjectId(recipient_id)})
        
        if not recipient:
            return jsonify({'message': 'Recipient not found'}), 404
        
        matches = find_matching_donors(recipient)
        # Replace null values with "NO Field" before sending response
        matches = replace_nulls_with_no_field(matches)
        return jsonify(parse_json(matches))
    except Exception as e:
        print(f"Error matching recipient: {e}")
        return jsonify({'message': f'Error matching recipient: {str(e)}'}), 500

def find_matching_donors(recipient):
    # Blood group compatibility
    compatible_blood_groups = get_compatible_blood_groups(recipient['bloodGroup'])
    
    # Build query - NoSQL advantage: complex queries in one go
    query = {
        'bloodGroup': {'$in': compatible_blood_groups},
        'available': True
    }
    
    # Location matching (optional, can be adjusted)
    if 'location' in recipient and recipient['location'] and recipient['location'] != "NO Field":
        query['location'] = recipient['location']
    
    # Find matching donors
    matching_donors = list(donors.find(query))
    return matching_donors

def get_compatible_blood_groups(blood_group):
    # Blood group compatibility chart
    compatibility = {
        'A+': ['A+', 'A-', 'O+', 'O-'],
        'A-': ['A-', 'O-'],
        'B+': ['B+', 'B-', 'O+', 'O-'],
        'B-': ['B-', 'O-'],
        'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        'AB-': ['A-', 'B-', 'AB-', 'O-'],
        'O+': ['O+', 'O-'],
        'O-': ['O-']
    }
    
    return compatibility.get(blood_group, [])

# Donation routes
@app.route('/api/donations', methods=['GET'])
@token_required
def get_donations(current_user):
    try:
        result = list(donations.find())
        
        # Populate donor and recipient info
        for donation in result:
            if 'donorId' in donation:
                donor = donors.find_one({'_id': ObjectId(donation['donorId'])})
                if donor:
                    donation['donor'] = parse_json(donor)
            
            if 'recipientId' in donation:
                recipient = recipients.find_one({'_id': ObjectId(donation['recipientId'])})
                if recipient:
                    donation['recipient'] = parse_json(recipient)
        
        # Replace null values with "NO Field" before sending response
        result = replace_nulls_with_no_field(result)
        return jsonify(parse_json(result))
    except Exception as e:
        print(f"Error getting donations: {e}")
        return jsonify({'message': f'Error getting donations: {str(e)}'}), 500

@app.route('/api/donations', methods=['POST'])
@token_required
def add_donation(current_user):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['donorId', 'recipientId', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Set default status if not provided
        if 'status' not in data:
            data['status'] = 'Pending'
        
        # Check if donor and recipient exist
        donor = donors.find_one({'_id': ObjectId(data['donorId'])})
        recipient = recipients.find_one({'_id': ObjectId(data['recipientId'])})
        
        if not donor:
            return jsonify({'message': 'Donor not found'}), 404
        
        if not recipient:
            return jsonify({'message': 'Recipient not found'}), 404
        
        # Replace empty strings and null values with "NO Field"
        data = process_input_data(data)
        
        # Update donor availability
        donors.update_one(
            {'_id': ObjectId(data['donorId'])}, 
            {
                '$set': {'available': False, 'lastDonated': data['date']},
                # NoSQL advantage: Push to embedded array
                '$push': {'donationHistory': {
                    'date': data['date'],
                    'recipientId': data['recipientId'],
                    'recipientName': recipient['name'],
                    'status': data['status']
                }}
            }
        )
        
        # Add donation details - NoSQL advantage: rich document structure
        data['donorName'] = donor['name']
        data['donorBloodGroup'] = donor['bloodGroup']
        data['recipientName'] = recipient['name']
        data['recipientBloodGroup'] = recipient['bloodGroup']
        data['hospital'] = recipient.get('hospital', 'NO Field')
        data['urgencyLevel'] = recipient.get('urgencyLevel', 'Medium')
        
        # Add tracking information - NoSQL advantage: flexible schema
        data['tracking'] = [
            {
                'status': 'Created',
                'timestamp': datetime.datetime.utcnow().isoformat(),
                'notes': 'Donation record created'
            }
        ]
        
        donation_id = donations.insert_one(data).inserted_id
        return jsonify({'message': 'Donation record created successfully', 'id': str(donation_id)}), 201
    except Exception as e:
        print(f"Error adding donation: {e}")
        return jsonify({'message': f'Error adding donation: {str(e)}'}), 500

@app.route('/api/donations/<id>', methods=['PUT'])
@token_required
def update_donation(current_user, id):
    try:
        data = request.get_json()
        
        # Remove _id field if present to avoid immutable field error
        if '_id' in data:
            del data['_id']
        
        # Replace empty strings and null values with "NO Field"
        data = process_input_data(data)
            
        # Check if donation exists
        donation = donations.find_one({'_id': ObjectId(id)})
        if not donation:
            return jsonify({'message': 'Donation record not found'}), 404
        
        # Add status change to tracking - NoSQL advantage: document updates
        if 'status' in data and data['status'] != donation.get('status'):
            tracking_entry = {
                'status': data['status'],
                'timestamp': datetime.datetime.utcnow().isoformat(),
                'notes': data.get('notes', f"Status changed to {data['status']}")
            }
            
            # Update with $push to add to tracking array
            donations.update_one(
                {'_id': ObjectId(id)},
                {'$push': {'tracking': tracking_entry}}
            )
        
        # Update donation status
        donations.update_one({'_id': ObjectId(id)}, {'$set': data})
        
        # If status is completed, update donor availability
        if 'status' in data and data['status'] == 'Completed':
            # Update donor's donation history - NoSQL advantage
            donors.update_one(
                {'_id': ObjectId(donation['donorId']), 'donationHistory.recipientId': donation['recipientId']},
                {'$set': {'donationHistory.$.status': 'Completed'}}
            )
        elif 'status' in data and data['status'] == 'Cancelled':
            # Make donor available again
            donors.update_one(
                {'_id': ObjectId(donation['donorId'])},
                {
                    '$set': {'available': True},
                    # Update donation history status
                    '$set': {'donationHistory.$[elem].status': 'Cancelled'}
                },
                array_filters=[{'elem.recipientId': donation['recipientId']}]
            )
        
        return jsonify({'message': 'Donation record updated successfully'})
    except Exception as e:
        print(f"Error updating donation: {e}")
        return jsonify({'message': f'Error updating donation: {str(e)}'}), 500

# NoSQL specific routes - Aggregation and analytics
@app.route('/api/analytics/donations-by-blood-group', methods=['GET'])
@token_required
def donations_by_blood_group(current_user):
    try:
        # MongoDB aggregation pipeline - NoSQL advantage
        pipeline = [
            {'$group': {
                '_id': '$donorBloodGroup',
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        result = list(donations.aggregate(pipeline))
        return jsonify(result)
    except Exception as e:
        print(f"Error in analytics: {e}")
        return jsonify({'message': f'Error in analytics: {str(e)}'}), 500

@app.route('/api/analytics/donations-by-month', methods=['GET'])
@token_required
def donations_by_month(current_user):
    try:
        # MongoDB aggregation pipeline - NoSQL advantage
        pipeline = [
            {'$addFields': {
                'month': {'$substr': ['$date', 0, 7]}  # Extract YYYY-MM
            }},
            {'$group': {
                '_id': '$month',
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        
        result = list(donations.aggregate(pipeline))
        return jsonify(result)
    except Exception as e:
        print(f"Error in analytics: {e}")
        return jsonify({'message': f'Error in analytics: {str(e)}'}), 500

@app.route('/api/analytics/urgency-distribution', methods=['GET'])
@token_required
def urgency_distribution(current_user):
    try:
        # MongoDB aggregation pipeline - NoSQL advantage
        pipeline = [
            {'$group': {
                '_id': '$urgencyLevel',
                'count': {'$sum': 1}
            }}
        ]
        
        result = list(recipients.aggregate(pipeline))
        return jsonify(result)
    except Exception as e:
        print(f"Error in analytics: {e}")
        return jsonify({'message': f'Error in analytics: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
