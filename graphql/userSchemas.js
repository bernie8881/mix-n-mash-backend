var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLID = require('graphql').GraphQLID;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
const { isTypeSystemExtensionNode, GraphQLBoolean, GraphQLScalarType } = require('graphql');
var GraphQLDate = require('graphql-date');
var UserModel = require('../models/User');

var userType = new GraphQLObjectType({
    name: 'user',
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            email: {
                type: GraphQLString
            },
            hashedPassword: {
                type: GraphQLString
            },
            bio: {
                type: GraphQLString
            },
            numFollowers: {
                type: GraphQLInt
            },
            active: {
                type: GraphQLBoolean
            }
        }
    }
});

var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: function () {
        return {
            users: {
                type: new GraphQLList(userType),
                resolve: function () {
                    const users = UserModel.find().exec()
                    if (!isTypeSystemExtensionNode) {
                        throw new Error('Error')
                    }
                    return users
                }
            },
            user: {
                type: userType,
                args: {
                    id: {
                        name: '_id',
                        type: GraphQLString
                    }
                },
                resolve: function (root, params) {
                    const userDetails = UserModel.findById(params.id).exec()
                    if (!userDetails) {
                        throw new Error('Error')
                    }
                    return userDetails
                }
            }
        }
    }
});

var mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
        return {
            addUser: {
                type: userType,
                args: {
                    username: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    email: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    hashedPassword: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    bio: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    numFollowers: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    active: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: function (root, params) {
                    const userModel = new UserModel(params);
                    const newUser = userModel.save();
                    if (!newUser) {
                        throw new Error('Error');
                    }
                    return newUser
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });