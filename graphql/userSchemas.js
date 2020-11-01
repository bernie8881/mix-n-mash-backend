const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLID = require('graphql').GraphQLID;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const { isTypeSystemExtensionNode, GraphQLBoolean, GraphQLScalarType, GraphQLInputObjectType } = require('graphql');
const GraphQLDate = require('graphql-date');
const UserModel = require('../models/User');

var genrePreferencesType = new GraphQLObjectType({
    name: 'genrePreferences',
    fields: function(){
        return{
            genre: {
                type: GraphQLString
            },
            genreIncVal: {
                type: GraphQLInt
            }
        }
    }
});

var genrePreferencesInputType = new GraphQLInputObjectType({
    name: 'genrePreferencesInput',
    fields: function(){
        return{
            genre: {
                type: GraphQLString
            },
            genreIncVal: {
                type: GraphQLInt
            }
        }
    }
});

var mashmateType = new GraphQLObjectType({
    name: 'mashmate',
    fields: function(){
        return{
            senderId: {
                type: GraphQLString
            },
            recipientId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            timeSent: {
                type: GraphQLInt
            },
            seen: {
                type: GraphQLBoolean
            }
        }
    }
});

var mashmateInputType = new GraphQLInputObjectType({
    name: 'mashmateInput',
    fields: function(){
        return{
            senderId: {
                type: GraphQLString
            },
            recipientId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            timeSent: {
                type: GraphQLInt
            },
            seen: {
                type: GraphQLBoolean
            }
        }
    }
});

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
            following: {
                type: new GraphQLList(GraphQLString)
            },
            mashmates: {
                type: new GraphQLList(GraphQLString)
            },
            mixtapes: {
                type: new GraphQLList(GraphQLString)
            },
            genrePreferences: {
                type: new GraphQLList(genrePreferencesType)
            },
            sentMashmateRequests: {
                type: new GraphQLList(mashmateType)
            },
            receivedMashmateRequests: {
                type: new GraphQLList(mashmateType)
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
                    following: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    mashmates: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    mixtapes: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    genrePreferences: {
                        type: new GraphQLNonNull(new GraphQLList(genrePreferencesInputType))
                    },
                    sentMashmateRequests: {
                        type: new GraphQLNonNull(new GraphQLList(mashmateInputType))
                    },
                    receivedMashmateRequests: {
                        type: new GraphQLNonNull(new GraphQLList(mashmateInputType))
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