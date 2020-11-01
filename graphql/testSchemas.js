var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLID = require('graphql').GraphQLID;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLInt = require('graphql').GraphQLInt;
const { isTypeSystemExtensionNode } = require('graphql');
var GraphQLDate = require('graphql-date');
var TestModel = require('../models/Test');

var testType = new GraphQLObjectType({
    name: 'test',
    fields: function () {
        return {
            _id: {
                type: GraphQLString
            },
            username: {
                type: GraphQLString
            },
        }
    }
});

var queryType = new GraphQLObjectType({
    name: 'Query',
    fields: function () {
        return {
            tests: {
                type: new GraphQLList(testType),
                resolve: function () {
                    const tests = TestModel.find().exec()
                    if (!isTypeSystemExtensionNode) {
                        throw new Error('Error')
                    }
                    return tests
                }
            },
            test: {
                type: testType,
                args: {
                    id: {
                        name: '_id',
                        type: GraphQLString
                    }
                },
                resolve: function (root, params) {
                    const testDetails = TestModel.findById(params.id).exec()
                    if (!testDetails) {
                        throw new Error('Error')
                    }
                    return testDetails
                }
            }
        }
    }
});

var mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: function () {
        return {
            addTest: {
                type: testType,
                args: {
                    username: {
                        type: new GraphQLNonNull(GraphQLString)
                    }
                },
                resolve: function (root, params) {
                    const testModel = new TestModel(params);
                    const newTest = testModel.save();
                    if (!newTest) {
                        throw new Error('Error');
                    }
                    return newTest
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({ query: queryType, mutation: mutation });