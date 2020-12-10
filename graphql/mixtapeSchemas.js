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
            likesToday: {
                type: GraphQLInt
            },
            likesThisWeek: {
                type: GraphQLInt
            },
            listensToday: {
                type: GraphQLInt
            },
            listensThisWeek: {
                type: GraphQLInt
            },
            ownerActive: {
                type: new GraphQLNonNull(GraphQLBoolean)
            }
        }
    }
});

var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: function () {
        return {
            // Get all mixtapes
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

            // Get one mixtape by id
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

            // Get the list of hottest mixtapes based on user preferences
            hottestMixtapes: {
                type: new GraphQLList(mixtapeType),
                args: {
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    criteria: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    skip: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    limit: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    following: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLString))
                    }
                },
                resolve: async function (root, params) {
                    // Get the current time
                    const dayAgo = new Date(Date.now() - 1000*60*60*24);
                    const weekAgo = new Date(Date.now() - 1000*60*60*24*7);

                    let mixtapes = [];
                    let cursor;

                    if(params.criteria === "dayFollowers" || params.criteria === "weekFollowers" || params.criteria === "allTimeFollowers"){
                        cursor = MixtapeModel.find({$and: [{private: false}, {ownerActive: true}, {ownerId: {$in: params.following}}]}).cursor();
                    } else {
                        cursor = MixtapeModel.find({$and: [{private: false}, {ownerActive: true}]}).cursor();
                    }

                    let mixtape;
                    while ((mixtape = await cursor.next())) {
                        // Start at the end
                        let index = mixtape.likesOverTime.length - 1;
                        let likesToday = 0;
                        let likesThisWeek = 0;
                        let listensToday = 0;
                        let listensThisWeek = 0;

                        // While the time is before a week ago
                        while(index >= 0 && mixtape.likesOverTime[index].time > weekAgo){
                            // While the time is before a day ago
                            if(mixtape.likesOverTime[index].time > dayAgo){
                                likesToday += 1;
                            }

                            likesThisWeek += 1;

                            // Step back
                            index -= 1;
                        }

                        index = mixtape.listensOverTime.length - 1;

                        // While the time is before a week ago
                        while(index >= 0 && mixtape.listensOverTime[index].time > weekAgo){
                            // While the time is before a day ago
                            if(mixtape.listensOverTime[index].time > dayAgo){
                                listensToday += 1;
                            }

                            listensThisWeek += 1;

                            // Step back
                            index -= 1;
                        }

                        mixtape.likesToday = likesToday;
                        mixtape.likesThisWeek = likesThisWeek;
                        mixtape.listensToday = listensToday;
                        mixtape.listensThisWeek = listensThisWeek;

                        mixtapes.push(mixtape);
                    }

                    // Sort, paginate, then return
                    if(params.criteria === "day" || params.criteria === "dayFollowers"){
                        return mixtapes.sort((b, a) => (a.listensToday + 5*a.likesToday) - (b.listensToday + 5*b.likesToday)).slice(params.skip, params.skip + params.limit);
                    } else if(params.criteria === "week" || params.criteria === "weekFollowers"){
                        return mixtapes.sort((b, a) => (a.listensThisWeek + 5*a.likesThisWeek) - (b.listensThisWeek + 5*b.likesThisWeek)).slice(params.skip, params.skip + params.limit);
                    } else {
                        return mixtapes.sort((b, a) => (a.listens + 5*a.likes) - (b.listens + 5*b.likes)).slice(params.skip, params.skip + params.limit);
                    }
                }
            },

            // Get the mixtapes that a user owns or is shared into
            getUserMixtapes: {
                type: new GraphQLList(mixtapeType),
                args: {
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    const mixtapes = MixtapeModel.find({
                        $and: [{
                            $or:[
                                {ownerId: params.userId},
                                {"collaborators.userId": params.userId},
                                ]
                            }, 
                            {ownerActive: true}]
                    }).exec();
                    return mixtapes
                }
            },

            // Get all user mixtapes regardless of active status
            getAllUserMixtapes: {
                type: new GraphQLList(mixtapeType),
                args: {
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    const mixtapes = MixtapeModel.find({
                            $or:[
                                {ownerId: params.userId},
                                {"collaborators.userId": params.userId},
                                ]
                    }).exec();
                    return mixtapes
                }
            },

            // Get the list of mixtapes to display on a user's page
            getUserPageMixtapes: {
                type: new GraphQLList(mixtapeType),
                args: {
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    otherUserId: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params) {
                    const mixtapes = MixtapeModel.find(
                        {
                            $and: [{
                                $or:[
                                    {ownerId: params.userId},
                                    {"collaborators.userId": params.userId},
                                    {private: false}
                                ]
                            },
                            {
                                $or: [
                                    {ownerId: params.otherUserId},
                                    {"collaborators.userId": params.otherUserId}
                                ]
                            },
                            {ownerActive: true}]
                        }
                    ).exec();
                    return mixtapes
                }
            },

            // Does a search for mixtapes
            queryMixtapes: {
                type: new GraphQLList(mixtapeType),
                args: {
                    searchTerm: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    skip: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    limit: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve: function(root, params) {
                    return MixtapeModel.find({title: {$regex: params.searchTerm, $options: "i"},
                        $and: [{$or:[{ownerId: params.userId},{"collaborators.userId": params.userId},{private: false}]}, {ownerActive: true}]})
                        .skip(params.skip).limit(params.limit).exec();
                }
            },
        }
    }
});

var mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
        return {
            // Createes a new mixtape
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
                    params.likesOverTime = [];
                    params.listensOverTime = [];
                    params.ownerActive = true;

                    const mixtapeModel = new MixtapeModel(params);
                    const newMixtape = mixtapeModel.save();
                    if (!newMixtape) {
                        throw new Error('Error');
                    }
                    return newMixtape
                }
            },

            // Creates a new mixape based on an existing one
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
                    params.likesOverTime = [];
                    params.listensOverTime = [];
                    params.ownerActive = true;

                    const mixtapeModel = new MixtapeModel(params);
                    const newMixtape = mixtapeModel.save();
                    if (!newMixtape) {
                        throw new Error('Error');
                    }
                    return newMixtape
                }
            },

            // Takes in another mixtapes songs and genres, and mashes them into an existing mixtape
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

            // Adds a mixtape - DEPRECATED
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
                    },
                    ownerActive: {
                        type: new GraphQLNonNull(GraphQLBoolean)
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

            // Updates a mixtape - DEPRECATED
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
                    },
                    ownerActive: {
                        type: new GraphQLNonNull(GraphQLBoolean)
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
                            ownerActive: params.ownerActive
                        }, 
                        function (err) {
                        if (err) return next(err);
                    });
                }
            },

            // Removes a mixtape by id
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

            // Removes all mixtapes from the database
            removeMixtapes: {
                type: GraphQLBoolean,
                resolve: function () {
                    MixtapeModel.deleteMany({}).exec();
                    return true;
                }
            },

             // Updates the title of the mixtape
            updateMixtapeTitle: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    title: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                },
                resolve(root, params) {
                    return MixtapeModel.findByIdAndUpdate(params.id,
                        {   title: params.title,
                        }, 
                        function (err) {
                        if (err) return next(err);
                    });
                }
            },

            // Updates the description of the mixtape
            updateMixtapeDescription: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    description: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                },
                resolve(root, params) {
                    return MixtapeModel.findByIdAndUpdate(params.id,
                        {   description: params.description,
                        }, 
                        function (err) {
                        if (err) return next(err);
                    });
                }
            },

            // Updates the genres of the mixtape
            updateMixtapeGenres: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    genres: {
                        type: new GraphQLNonNull( new GraphQLList(GraphQLString))
                    },
                },
                resolve(root, params) {
                    return MixtapeModel.findByIdAndUpdate({_id: params.id}, {genres: params.genres}, {new: true}).exec();
                }
            },

            // Adds songs to the mixtape
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

            // Edits the song order of the mixtape/deletes songs from the mixtape
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

            // Adds a comment to the mixtape
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

            // Adds a reply to a comment on the mixtape
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

            // Updates the number of likes on a mixtape and the likes array
            updateLikes: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    incAmount: {
                        type: new GraphQLNonNull(GraphQLInt)
                    }
                },
                resolve: function(root, params){
                    if(params.incAmount > 0){
                        // The user liked the mixtape, add their id to the list
                        const likeObj = {userId: params.userId}
                        return MixtapeModel.findByIdAndUpdate(params.id, {$inc: {likes: params.incAmount}, $push: {likesOverTime: likeObj} }, {new: true}).exec();
                    } else {
                        // The user unliked the mixtape, remove their id from the list
                        return MixtapeModel.findByIdAndUpdate(params.id, {$inc: {likes: params.incAmount}, $pull: {likesOverTime: {userId: params.userId}}}, {new: true}).exec();
                    }
                }
            },

            // Updates the number of dislikes in the mixtape
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
            },

            addListen: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    userId: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function(root, params){
                    const listenObj = {userId: params.userId};

                    return MixtapeModel.findByIdAndUpdate(params.id, {$inc: {listens: 1}, $push: {listensOverTime: listenObj}}, {new: true}).exec();
                }
            },

            updatePrivate: {
                type: mixtapeType,
                args: {
                    id: {
                        name: '_id',
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    private: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: function(root, params){
                    return MixtapeModel.findByIdAndUpdate(params.id, {$set: {private: params.private}}, {new: true}).exec()
                }
            },
            updateOwnerActive: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    ownerActive: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    }
                },
                resolve: function(root, params){
                    return MixtapeModel.findByIdAndUpdate(params.id, {$set: {ownerActive: params.ownerActive}}, {new: true}).exec();
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });