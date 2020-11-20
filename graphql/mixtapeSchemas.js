const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const GraphQLDate = require('graphql-date');
const MixtapeModel = require('../models/Mixtape');
const { GraphQLBoolean, GraphQLInputObjectType, GraphQLScalarType } = require('graphql');

const songType = new GraphQLObjectType({
    name: 'song',
    fields: function(){
        return {
            name: {
                type: GraphQLString
            },
            youtubeId: {
                type: GraphQLString
            }
        }
    }
});

const songInputType = new GraphQLInputObjectType({
    name: 'songInput',
    fields: function(){
        return {
            name: {
                type: GraphQLString
            },
            youtubeId: {
                type: GraphQLString
            }
        }
    }
});

const replyType = new GraphQLObjectType({
    name: 'reply',
    fields: function(){
        return {
            userId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            content: {
                type: GraphQLString
            },
            publishingTime: {
                type: GraphQLDate
            }
        }
    }
});

const replyInputType = new GraphQLInputObjectType({
    name: 'replyInput',
    fields: function(){
        return {
            userId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            content: {
                type: GraphQLString
            }
        }
    }
});

const commentType = new GraphQLObjectType({
    name: 'comment',
    fields: function(){
        return {
            id: {
                type: GraphQLString
            },
            replies:{
                type: new GraphQLList(replyType)
            },
            userId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            content: {
                type: GraphQLString
            },
            publishingTime: {
                type: GraphQLDate
            }
        }
    }
});

const commentInputType = new GraphQLInputObjectType({
    name: 'commentInput',
    fields: function(){
        return {
            userId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            content: {
                type: GraphQLString
            }
        }
    }
});

const collaboratorsType = new GraphQLObjectType({
    name: 'collaborators',
    fields: function(){
        return {
            userId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            privilegeLevel: {
                type: GraphQLString
            }
        }
    }
});

const collaboratorsInputType = new GraphQLInputObjectType({
    name: 'collaboratorsInput',
    fields: function(){
        return {
            userId: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
            privilegeLevel: {
                type: GraphQLString
            }
        }
    }
});

const mixtapeType = new GraphQLObjectType({
    name: 'mixtape',
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            title: {
                type: GraphQLString
            },
            description: {
                type: GraphQLString
            },
            genres: {
                type: new GraphQLList(GraphQLString)
            },
            image: {
                type: new GraphQLList(GraphQLString)
            },
            songs: {
                type: new GraphQLList(songType)
            },
            ownerId: {
                type: GraphQLString
            },
            ownerName: {
                type: GraphQLString
            },
            listens: {
                type: GraphQLInt
            },
            likes: {
                type: GraphQLInt
            },
            dislikes: {
                type: GraphQLInt
            },
            comments: {
                type: new GraphQLList(commentType)
            },
            private: {
                type: GraphQLBoolean
            },
            collaborators: {
                type: new GraphQLList(collaboratorsType)
            },
            timeCreated: {
                type: GraphQLDate
            },
            likesPerDay: {
                type: new GraphQLList(GraphQLInt)
            },
            listensPerDay: {
                type: new GraphQLList(GraphQLInt)
            }
        }
    }
});

var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: function () {
        return {
            mixtapes: {
                type: new GraphQLList(mixtapeType),
                resolve: function () {
                    const mixtapes = MixtapeModel.find().exec()
                    if (!mixtapes) {
                        throw new Error('Error')
                    }
                    return mixtapes
                }
            },
            mixtape: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: GraphQLString
                    },
                },
                resolve: function (root, params) {
                    const mixtapeDetails = MixtapeModel.findById(params.id).exec()
                    if (!mixtapeDetails) {
                        throw new Error('Error')
                    }
                    return mixtapeDetails
                }
            },
            hottestMixtapes: {
                type: new GraphQLList(mixtapeType),
                resolve: function () {
                    const mixtapes = MixtapeModel.find().exec()
                    if (!mixtapes) {
                        throw new Error('Error')
                    }
                    return mixtapes
                }
            },
            getUserMixtapes: {
                type: new GraphQLList(mixtapeType),
                args: {
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    const mixtapes = MixtapeModel.find(
                        {
                            $or:[
                                {ownerId: params.userId},
                                {"collaborators.userId": params.userId}
                            ]
                        }
                    ).exec();
                    return mixtapes
                }
            },
            queryMixtapes: {
                type: new GraphQLList(mixtapeType),
                args: {
                    searchTerm: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    return MixtapeModel.find({title: {$regex: params.searchTerm, $options: "i"}}).exec();
                }
            },
        }
    }
});

var mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
        return {
            createNewMixtape: {
                type: mixtapeType,
                args: {
                    ownerId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    ownerName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                },
                resolve: function(root, params){
                    params.title = "Untitled";
                    params.description = "Your new Mixtape";
                    params.genres = [];
                    params.image = [];
                    params.songs = [];
                    params.listens = 0;
                    params.likes = 0;
                    params.dislikes = 0;
                    params.comments = [];
                    params.private = true;
                    params.collaborators = [];
                    params.likesPerDay = [];
                    params.listensPerDay = [];

                    const mixtapeModel = new MixtapeModel(params);
                    const newMixtape = mixtapeModel.save();
                    if (!newMixtape) {
                        throw new Error('Error');
                    }
                    return newMixtape
                }
            },
            createMixtapeFromBase: {
                type: mixtapeType,
                args: {
                    ownerId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    ownerName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    title: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    description: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    genres: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    image: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    songs: {
                        type: new GraphQLNonNull(new GraphQLList(songInputType))
                    }
                },
                resolve: function(root, params){
                    params.listens = 0;
                    params.likes = 0;
                    params.dislikes = 0;
                    params.comments = [];
                    params.private = true;
                    params.collaborators = [];
                    params.likesPerDay = [];
                    params.listensPerDay = [];

                    const mixtapeModel = new MixtapeModel(params);
                    const newMixtape = mixtapeModel.save();
                    if (!newMixtape) {
                        throw new Error('Error');
                    }
                    return newMixtape
                }
            },
            mashMixtape: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    title: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    genres: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    },
                    songs: {
                        type: new GraphQLNonNull(new GraphQLList(songInputType))
                    }
                },
                resolve: function(root, params){
                    return MixtapeModel.findByIdAndUpdate(params.id, {title: params.title, songs: params.songs, genres: params.genres}).exec();
                }
            },
            addMixtape: {
                type: mixtapeType,
                args: {
                    title: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    description: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    genres: {
                        type: new GraphQLNonNull( new GraphQLList(GraphQLString))
                    },
                    image: {
                        type: new GraphQLNonNull( new GraphQLList(GraphQLString))
                    },
                    songs: {
                        type: new GraphQLNonNull( new GraphQLList(songInputType))
                    },
                    ownerId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    ownerName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    listens:{
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    likes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    dislikes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    comments: {
                        type: new GraphQLNonNull( new GraphQLList(commentInputType))
                    },
                    private: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    collaborators: {
                        type: new GraphQLNonNull(new GraphQLList(collaboratorsInputType))
                    },
                    likesPerDay: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLInt))
                    },
                    listensPerDay: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLInt))
                    }
                },
                resolve: function (root, params) {
                    const mixtapeModel = new MixtapeModel(params);
                    const newMixtape = mixtapeModel.save();
                    if (!newMixtape) {
                        throw new Error('Error');
                    }
                    return newMixtape
                }
            },
            updateMixtape: {
                type: mixtapeType,
                args: {
                    _id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    title: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    description: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    genres: {
                        type: new GraphQLNonNull( new GraphQLList(GraphQLString))
                    },
                    image: {
                        type: new GraphQLNonNull( new GraphQLList(GraphQLString))
                    },
                    songs: {
                        type: new GraphQLNonNull( new GraphQLList(songInputType))
                    },
                    ownerId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    ownerName: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    listens:{
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    likes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    dislikes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    comments: {
                        type: new GraphQLNonNull( new GraphQLList(commentInputType))
                    },
                    private: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    collaborators: {
                        type: new GraphQLNonNull(new GraphQLList(collaboratorsInputType))
                    },
                    likesPerDay: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLInt))
                    },
                    listensPerDay: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLInt))
                    }
                },
                resolve(root, params) {
                    return MixtapeModel.findByIdAndUpdate(params._id,
                        {   title: params.title,
                            description: params.description,
                            genres: params.genres,
                            image: params.image,
                            songs: params.songs,
                            ownerId: params.ownerId,
                            ownerName: params.ownerName,
                            listens: params.listens,
                            likes: params.likes,
                            dislikes: params.dislikes,
                            comments: params.comments,
                            private: params.private,
                            collaborators:params.collaborators,
                            likesPerDay: params.likesPerDay,
                            listensPerDay: params.listensPerDay,
                        }, 
                        function (err) {
                        if (err) return next(err);
                    });
                }
            },
            removeMixtape: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve(root, params) {
                    const remMixtape = MixtapeModel.findByIdAndRemove(params.id).exec();
                    if (!remMixtape) {
                        throw new Error('Error')
                    }
                    return remMixtape;
                }
            },
            removeMixtapes: {
                type: GraphQLBoolean,
                resolve: function () {
                    MixtapeModel.deleteMany({}).exec();
                    return true;
                }
            },

            addSongs: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    songs: {
                        type: new GraphQLNonNull(new GraphQLList(songInputType))
                    }
                },
                resolve: function (root, params) {
                   return MixtapeModel.findOneAndUpdate({_id: params.id}, { $push: {songs: {$each: params.songs}}}, {new: true}).exec();
                }
            },
            editSongs: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    songs: {
                        type: new GraphQLNonNull(new GraphQLList(songInputType))
                    }
                },
                resolve: function (root, params) {
                    return MixtapeModel.findOneAndUpdate({_id: params.id}, {$set: {songs: params.songs}}, {new: true}).exec();
                }
            },
            addComment: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    comment: {
                        type: new GraphQLNonNull(commentInputType)
                    }
                },
                resolve: function (root, params){
                    // Generate a unique id by combining the user ID with the current time
                    let id = params.comment.userId + Date.now();
                    params.comment.id = id;

                    // No replies, so empty array
                    params.comment.replies = [];

                    return MixtapeModel.findOneAndUpdate({_id: params.id}, {$push: {comments: params.comment}}, {new: true}).exec();
                }
            },
            addReply: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    commentId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    reply: {
                        type: new GraphQLNonNull(replyInputType)
                    }
                },
                resolve: function (root, params){
                    return MixtapeModel.findOneAndUpdate({$and: [{_id: params.id}, {"comments.id": params.commentId}]}, {$push: {"comments.$.replies": params.reply}}, {new: true});
                }
            },
            updateLikes: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    incAmount: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve: function(root, params){
                    return MixtapeModel.findByIdAndUpdate(params.id, {$inc: {likes: params.incAmount}}, {new: true}).exec();
                }
            },
            updateDislikes: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    incAmount: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve: function(root, params){
                    return MixtapeModel.findByIdAndUpdate(params.id, {$inc: {dislikes: params.incAmount}}, {new: true}).exec();
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });