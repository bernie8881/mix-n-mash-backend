const GraphQLSchema = require('graphql').GraphQLSchema;
const GraphQLObjectType = require('graphql').GraphQLObjectType;
const GraphQLList = require('graphql').GraphQLList;
const GraphQLNonNull = require('graphql').GraphQLNonNull;
const GraphQLString = require('graphql').GraphQLString;
const GraphQLInt = require('graphql').GraphQLInt;
const MixtapeModel = require('../models/Mixtape');
const { GraphQLBoolean, GraphQLInputObjectType } = require('graphql');
const { update } = require('../models/Mixtape');

const songsType = new GraphQLObjectType({
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

const songsInputType = new GraphQLInputObjectType({
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
                type: new GraphQLList(songsType)
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
            // comments: {
            //     type: new GraphQLList()
            // },
            private: {
                type: GraphQLBoolean
            },
            collaborators: {
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
            }
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
                        type: new GraphQLNonNull( new GraphQLList(songsInputType))
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
                    // comments: {
                    //     type: new GraphQLList()
                    // },
                    private: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    collaborators: {
                        type: new GraphQLNonNull(new GraphQLList(collaboratorsInputType))
                    },
                    timeCreated: {
                        type: new GraphQLNonNull(GraphQLInt)
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
                        type: new GraphQLNonNull( new GraphQLList(songsInputType))
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
                    // comments: {
                    //     type: new GraphQLList()
                    // },
                    private: {
                        type: new GraphQLNonNull(GraphQLBoolean)
                    },
                    collaborators: {
                        type: new GraphQLNonNull(new GraphQLList(collaboratorsInputType))
                    },
                    timeCreated: {
                        type: new GraphQLNonNull(GraphQLInt)
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
            },
            addSongs: {
                type: mixtapeType,
                args: {
                    id: {
                        name: "_id",
                        type: new GraphQLNonNull(GraphQLString)
                    },
                    songs: {
                        type: new GraphQLNonNull(new GraphQLList(songsInputType))
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
                        type: new GraphQLNonNull(new GraphQLList(songsInputType))
                    }
                },
                resolve: function (root, params) {
                    return MixtapeModel.findOneAndUpdate({_id: params.id}, {$set: {songs: params.songs}}, {new: true}).exec();
                }
            },
            removeMixtapes: {
                type: GraphQLBoolean,
                resolve: function () {
                    MixtapeModel.deleteMany({}).exec();
                    return true;
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });