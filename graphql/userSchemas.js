const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLID = require('graphql').GraphQLID;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const { isTypeSystemExtensionNode, GraphQLBoolean, GraphQLScalarType, GraphQLInputObjectType, GraphQLFloat } = require('graphql');
const GraphQLDate = require('graphql-date');
const UserModel = require('../models/User');

var genrePreferencesType = new GraphQLObjectType({
    name: 'genrePreferences',
    fields: function(){
        return{
            genre: {
                type: GraphQLString
            },
            val: {
                type: GraphQLFloat
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
            val: {
                type: GraphQLFloat
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
                    },
                    skip: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    limit: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve: function (root, params) {
                    return UserModel.find({username: {$regex: params.searchTerm, $options: 'i'}, active: true}).skip(params.skip).limit(params.limit).exec();
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
                    bio: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                },
                resolve: function (root, params) {
                    params.hashedPassword = "lmao_security";
                    params.numFollowers = Math.floor(Math.random()*100);
                    params.following = [];
                    params.likedMixtapes = [];
                    params.dislikeMixtapes = [];
                    params.genrePreferences = [];
                    params.receivedMashmateRequests = [];
                    mashmates = [];
                    params.active = true;

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
                    },
                    mixtapeGenres: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    genrePreferences: {
                        type: new GraphQLNonNull(new GraphQLList(genrePreferencesInputType))
                    },
                    wasDisliked: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: function (root, params) {
                    if(params.like){
                        // Add to list of liked mixtapes
                        for (let i=0; i < params.genrePreferences.length; i++){
                            let genre = params.genrePreferences[i].genre;
                            if (params.mixtapeGenres.includes(genre)){
                              params.genrePreferences[i].val += params.wasDisliked ? 0.1 : 0.05;
                              params.genrePreferences[i].val = Math.min(params.genrePreferences[i].val, 1);
                            }
                            // params.genrePreferences[i] = {genre: tempGenrePreferences[i].genre, val: tempGenrePreferences[i].val};
                        }
                        return UserModel.findByIdAndUpdate(params.id, {$push: {likedMixtapes: params.mixtapeId}, $pull: {dislikedMixtapes: params.mixtapeId}, genrePreferences: params.genrePreferences}, {new: true}).exec();
                    } else {
                        // Remove from list of liked mixtapes
                        for (let i=0; i < params.genrePreferences.length; i++){
                            let genre = params.genrePreferences[i].genre;
                            if (params.mixtapeGenres.includes(genre)){
                              params.genrePreferences[i].val -= 0.05;
                              params.genrePreferences[i].val = Math.max(params.genrePreferences[i].val, 0);
                            }
                            // params.genrePreferences[i] = {genre: tempGenrePreferences[i].genre, val: tempGenrePreferences[i].val};
                        }
                        return UserModel.findByIdAndUpdate(params.id, {$pull: {likedMixtapes: params.mixtapeId}, genrePreferences: params.genrePreferences}, {new: true}).exec();
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
                    },
                    mixtapeGenres: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    genrePreferences: {
                        type: new GraphQLNonNull(new GraphQLList(genrePreferencesInputType))
                    },
                    wasLiked: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: function (root, params) {
                    if(params.dislike){
                        // Add to list of liked mixtapes
                        for (let i=0; i < params.genrePreferences.length; i++){
                            let genre = params.genrePreferences[i].genre;
                            if (params.mixtapeGenres.includes(genre)){
                              params.genrePreferences[i].val -= params.wasLiked ? 0.1 : 0.05;
                              params.genrePreferences[i].val = Math.max(params.genrePreferences[i].val, 0);
                            }
                            // params.genrePreferences[i] = {genre: tempGenrePreferences[i].genre, val: tempGenrePreferences[i].val};
                        }
                        return UserModel.findByIdAndUpdate(params.id, {$push: {dislikedMixtapes: params.mixtapeId}, $pull: {likedMixtapes: params.mixtapeId}, genrePreferences: params.genrePreferences}, {new: true}).exec();
                    } else {
                        // Remove from list of liked mixtapes
                        for (let i=0; i < params.genrePreferences.length; i++){
                            let genre = params.genrePreferences[i].genre;
                            if (params.mixtapeGenres.includes(genre)){
                              params.genrePreferences[i].val += 0.05;
                              params.genrePreferences[i].val = Math.min(params.genrePreferences[i].val, 1);
                            }
                            // params.genrePreferences[i] = {genre: tempGenrePreferences[i].genre, val: tempGenrePreferences[i].val};
                        }
                        return UserModel.findByIdAndUpdate(params.id, {$pull: {dislikedMixtapes: params.mixtapeId}, genrePreferences: params.genrePreferences}, {new: true}).exec();
                    }
                }
            },
            removeUsers: {
                type: GraphQLBoolean,
                resolve: function () {
                    UserModel.deleteMany({}).exec();
                    return true;
                }
            },
            updateBio: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: GraphQLString
                    },
                    bio: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    return UserModel.findByIdAndUpdate(params.id, {$set: {bio: params.bio}}, {new: true}).exec();
                }
            },
            deactivateAccount: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: GraphQLString
                    }
                },
                resolve: function(root, params) {
                    return UserModel.findByIdAndUpdate(params.id, {$set: {active: false}}, {new:true}).exec();
                }
            },
            reactivateAccount: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: GraphQLString
                    }
                },
                resolve: function(root, params) {
                    return UserModel.findByIdAndUpdate(params.id, {$set: {active: true}}, {new:true}).exec();
                }
            },
            sendMashmateRequest: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    newMashmateRequest: {
                        type: new GraphQLNonNull(mashmateRequestInputType)
                    }
                },
                resolve: function(root, params) {
                    let temp = UserModel.findByIdAndUpdate(params.id,
                    {
                        $push: { receivedMashmateRequests: params.newMashmateRequest }
                    }, {new:true}).exec();
                    return temp;
                }
            },
            followUser: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: GraphQLString
                    },
                    idToFollow: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    let temp = UserModel.findByIdAndUpdate(params.id,
                    {
                        $push: { following: params.idToFollow }
                    }, {new:true}).exec();
                    return temp;
                }
            },
            incNumFollowers: {
                type: userType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                },
                resolve: function(root, params){
                    return UserModel.findByIdAndUpdate(params.id, {$inc: {numFollowers: 1}}, {new: true}).exec();
                }
            },
            unfollowUser: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: GraphQLString
                    },
                    idToUnfollow: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    let temp = UserModel.findByIdAndUpdate(params.id,
                    {
                        $pull: { following: params.idToUnfollow }
                    }, {new:true}).exec();
                    return temp;
                }
            },
            decNumFollowers: {
                type: userType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                },
                resolve: function(root, params){
                    return UserModel.findByIdAndUpdate(params.id, {$inc: {numFollowers: -1}}, {new: true}).exec();
                }
            },
            viewMashmateRequest: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    senderId: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    return UserModel.findOneAndUpdate({$and: [{_id: params.id}, {"receivedMashmateRequests.senderId": params.senderId}]}, {"receivedMashmateRequests.$.seen": true}, {new: true}).exec();
                }
            },
            removeMashmateRequests: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                },
                resolve: function(root, params) {
                    return UserModel.findByIdAndUpdate(params.id, {receivedMashmateRequests: [], mashmates: []}, {new: true}).exec();
                }
            },
            resolveMashmateRequest: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    senderId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    username: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    senderUsername: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    accepted: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: async function(root, params) {
                    if(params.accepted){
                        const mashmateObj = {id: params.senderId, username: params.senderUsername};
                        const otherMashmateObj = {id: params.id, username: params.username};
                        await UserModel.findByIdAndUpdate(params.senderId, {$push: {mashmates: otherMashmateObj}}).exec();
                        return UserModel.findByIdAndUpdate(params.id, {$pull: {receivedMashmateRequests: {senderId: params.senderId}}, $push: {mashmates: mashmateObj}}, {new: true}).exec();
                    } else {
                        return UserModel.findByIdAndUpdate(params.id, {$pull: {receivedMashmateRequests: {senderId: params.senderId}}}, {new: true}).exec();
                    }
                }
            },
            removeMashmate: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    mashmateId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    username: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    mashmateUsername: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: async function(root, params) {
                    const mashmateObj = {id: params.mashmateId, username: params.mashmateUsername};
                    const otherMashmateObj = {id: params.id, username: params.username};
                    await UserModel.findByIdAndUpdate(params.mashmateId, {$pull: {mashmates: otherMashmateObj}}).exec();
                    return UserModel.findByIdAndUpdate(params.id, {$pull: {mashmates: mashmateObj}}, {new: true}).exec();
                }
            },
            updateGenrePreferences: {
                type: userType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    genrePreferences: {
                        type: new GraphQLNonNull(new GraphQLList(genrePreferencesInputType))
                    }
                },
                resolve: function(root, params){
                    return UserModel.findByIdAndUpdate(params.id, {genrePreferences: params.genrePreferences}, {new: true}).exec();
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });