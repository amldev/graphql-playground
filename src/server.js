var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

const mongoose = require('mongoose');

// Take course data
var courses = require('./data/course');

// https://www.youtube.com/watch?v=Vs_CBxCfFHk

// Initialize a GraphQL schema
var schema = buildSchema(`
  type Query {
    message: String
    suma: Int
    course(id: Int!): Course
    courses(topic: String): [Course]
  }
  type Mutation {
      updateCourseTopic(id: Int!, topic: String!): Course
  }
  type Course {
      id: Int
      title: String
      author: String
      description: String
      topic: String
      url: String
  }
`);

var getCourse = function(args) {
    var id = args.id;
    return courses.filter(course => {
        return course.id === id;
    })[0];
};

var getCourses = function (args) {
    if (args.topic) {
        var topic = args.topic;
        return courses.filter(course => {
            return course.topic === topic;
        })
    } else {
        return courses;
    }
};

var updateSelectCourseTopic = function({id, topic}) {
    courses.map(
        course => {
            if (course.id === id) {
                course.topic = topic;
                return course;
            }
        }
    );
    return courses.filter(course => course.id === id)[0];
}

// Root resolver
var root = { 
  message: () => 'Hello world!',
  suma: () =>  1 + 3,
  course: getCourse,
  courses: getCourses,
  updateCourseTopic: updateSelectCourseTopic
};

// Database connection debug
// 'mongodb://localhost:27017/hospitalDB'
const LOG_COLOR = "\x1b[36m%s\x1b[0m";

const CONNECTION_REFERENCE = 'mongodb://mugan86:E02427gz@ds125526.mlab.com:25526/graphql-mugan86';

// Database connection
mongoose.connection.openUri(CONNECTION_REFERENCE, { useNewUrlParser: true }, ( err, res) => {
    if ( err ) throw err;
    console.log(`Database: ${LOG_COLOR}`, 'online');
});


// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,  // Must be provided
  rootValue: root,
  graphiql: true,  // Enable GraphiQL when server endpoint is accessed in browser
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
