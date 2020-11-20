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

var mashmateRequestType = new GraphQLObjectType({
    name: 'mashmateRequest',
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
                type: GraphQLDate
            },
            seen: {
                type: GraphQLBoolean
            }
        }
    }
});

var mashmateRequestInputType = new GraphQLInputObjectType({
    name: 'mashmateRequestInput',
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
            seen: {
                type: GraphQLBoolean
            }
        }
    }
});

var mashmateType = new GraphQLObjectType({
    name: 'mashmate',
    fields: function(){
        return{
            id: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
        }
    }
});

var mashmateInputType = new GraphQLInputObjectType({
    name: 'mashmateInput',
    fields: function(){
        return{
            id: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
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
                type: new GraphQLList(mashmateType)
            },
            mixtapes: {
                type: new GraphQLList(GraphQLString)
            },
            likedMixtapes: {
                type: new GraphQLList(GraphQLString)
            },
            dislikedMixtapes: {
                type: new GraphQLList(GraphQLString)
            },
            genrePreferences: {
                type: new GraphQLList(genrePreferencesType)
            },
            sentMashmateRequests: {
                type: new GraphQLList(mashmateRequestType)
            },
            receivedMashmateRequests: {
                type: new GraphQLList(mashmateRequestType)
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
            },
            getUserByUsernameOrEmail: {
                type: userType,
                args: {
                    usernameOrEmail: {
                        type: GraphQLString
                    }
                },
                resolve: function (root, params) {
                    const userDetails = UserModel.findOne({ $or : [{email: params.usernameOrEmail}, {username: params.usernameOrEmail}] }).exec();
                    return userDetails;
                }
            },
            queryUsers: {
                type: new GraphQLList(userType),
                args: {
                    searchTerm: {
                        type: GraphQLString
                    }
                },
                resolve: function (root, params) {
                    return UserModel.find({username: {$regex: params.searchTerm, $options: 'i'}}).exec();
                }
            }
        }
    }
});

var mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
        return {
            createNewUser: {
                type: userType,
                args: {
                    username: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    email: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    hashedPassword:{
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params){
                    params.bio = "";
                    params.numFollowers = 0;
                    params.following = [];
                    params.mashmates = [];
                    params.mixtapes = [];
                    params.genrePreferences = [];
                    params.sentMashmateRequests = [];
                    params.receivedMashmateRequests = []
                    params.active = true;

                    const userModel = new UserModel(params);
                    const newUser = userModel.save();
                    if (!newUser) {
                        throw new Error('Error');
                    }
                    return newUser;
                }
            },
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
                        type: new GraphQLNonNull(new GraphQLList(mashmateInputType))
                    },
                    mixtapes: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    likedMixtapes: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    dislikedMixtapes: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    genrePreferences: {
                        type: new GraphQLNonNull(new GraphQLList(genrePreferencesInputType))
                    },
                    sentMashmateRequests: {
                        type: new GraphQLNonNull(new GraphQLList(mashmateRequestInputType))
                    },
                    receivedMashmateRequests: {
                        type: new GraphQLNonNull(new GraphQLList(mashmateRequestInputType))
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
            },
            addMixtape: {
                type: userType,
                args: {
                    id: {
                        name: '_id',
                        type: GraphQLString
                    },
                    mixtapeId: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    let temp = UserModel.findByIdAndUpdate(params.id,
                    {
                        $push: {
                            mixtapes: params.mixtapeId
                        }
                    }).exec();
                    return temp;
                }
            },
            setLikeMixtape: {
                type: userType,
                args: {
                    id: {
                        name: '_id',
                        type: GraphQLString
                    },
                    mixtapeId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    like: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: function (root, params) {
                    if(params.like){
                        // Add to list of liked mixtapes
                        return UserModel.findByIdAndUpdate(params.id, {$push: {likedMixtapes: params.mixtapeId}}, {new: true}).exec();
                    } else {
                        // Remove from list of liked mixtapes
                        return UserModel.findByIdAndUpdate(params.id, {$pull: {likedMixtapes: params.mixtapeId}}, {new: true}).exec();
                    }
                }
            },
            setDislikeMixtape: {
                type: userType,
                args: {
                    id: {
                        name: '_id',
                        type: GraphQLString
                    },
                    mixtapeId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    dislike: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: function (root, params) {
                    if(params.dislike){
                        // Add to list of liked mixtapes
                        return UserModel.findByIdAndUpdate(params.id, {$push: {dislikedMixtapes: params.mixtapeId}}, {new: true}).exec();
                    } else {
                        // Remove from list of liked mixtapes
                        return UserModel.findByIdAndUpdate(params.id, {$pull: {dislikedMixtapes: params.mixtapeId}}, {new: true}).exec();
                    }
                }
            },
            removeUsers: {
                type: GraphQLBoolean,
                resolve: function () {
                    UserModel.deleteMany({}).exec();
                    return true;
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });