var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLID = require('graphql').GraphQLID;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
var GraphQLDate = require('graphql-date');
var MixtapeModel = require('../models/Mixtape');
var CollaboratorModel = require('../models/Collaborator');
var CommentsModel = require('../models/Comments');
var ReplyModel = require('../models/Reply');
const { GraphQLBoolean } = require('graphql');

var songsType = new GraphQLObjectType({
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

var collaboratorsType = new GraphQLObjectType({
    name: 'collaborator',
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

var mixtapeType = new GraphQLObjectType({
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
                type: new GraphQLList(songsType)
            },
            ownerId: {
                type: GraphQLInt
            },
            likes: {
                type: GraphQLInt
            },
            dislikes: {
                type: GraphQLInt
            },
            // comments: {
            //     type: new GraphQLList()
            // },
            private: {
                type: GraphQLBoolean
            },
            collaborator: {
                type: new GraphQLList(collaboratorsType)
            },
            timeCreated: {
                type: GraphQLInt
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
                    _id: {
                        name: '_id',
                        type: GraphQLString
                    },
                },
                resolve: function (root, params) {
                    const mixtapeDetails = MixtapeModel.findById(params._id).exec()
                    if (!mixtapeDetails) {
                        throw new Error('Error')
                    }
                    return mixtapeDetails
                }
            },
        }
    }
});

var mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
        return {
            addMixtape: {
                type: mixtapeType,
                args: {
                    _id: {
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
                        type: new GraphQLNonNull( new GraphQLList(songsType))
                    },
                    ownerId: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    likes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    dislikes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    // comments: {
                    //     type: new GraphQLList()
                    // },
                    private: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    collaborator: {
                        type: new GraphQLNonNull(new GraphQLList(collaboratorsType))
                    },
                    timeCreated: {
                        type: new GraphQLNonNull(new GraphQLNonNull(GraphQLInt))
                    },
                    likesPerDay: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLInt))
                    },
                    listensPerDay: {
                        type: new GraphQLNonNull(new GraphQLList(GraphQLInt))
                    }
                },
                resolve: function (root, params) {
                    const mixtapeModel = new mixtapeModel(params);
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
                        type: new GraphQLNonNull( new GraphQLList(songsType))
                    },
                    ownerId: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    likes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    dislikes: {
                        type: new GraphQLNonNull(GraphQLInt)
                    },
                    // comments: {
                    //     type: new GraphQLList()
                    // },
                    private: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    collaborator: {
                        type: new GraphQLNonNull(new GraphQLList(collaboratorsType))
                    },
                    timeCreated: {
                        type: new GraphQLNonNull(new GraphQLNonNull(GraphQLInt))
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
                            likes: params.likes,
                            dislikes: params.dislikes,
                            // comments: [CommentsModel],
                            private: params.private,
                            collaborators:params.collaborators,
                            timeCreated: params.timeCreated,
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
                    _id: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve(root, params) {
                    const remMixtape = MixtapeModel.findByIdAndRemove(params._id).exec();
                    if (!remMixtape) {
                        throw new Error('Error')
                    }
                    return remMixtape;
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });