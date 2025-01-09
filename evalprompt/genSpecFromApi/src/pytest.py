from flask import Flask, jsonify, request 
from flask_restful import Resource, Api 
app = Flask(__name__) 
api = Api(app)  
class Hello(Resource): 
    def get(self): 
        return jsonify({'message': 'hello world'}) 
    def post(self): 
        data = request.get_json()
        return jsonify({'data': data}), 201
class Square(Resource): 
    def get(self, num): 
        return jsonify({'square': num**2})
api.add_resource(Hello, '/') 
api.add_resource(Square, '/square/<int:num>') 
if __name__ == '__main__': 
  
    app.run(debug = True) 