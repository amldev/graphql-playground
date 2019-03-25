var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

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


// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,  // Must be provided
  rootValue: root,
  graphiql: true,  // Enable GraphiQL when server endpoint is accessed in browser
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
