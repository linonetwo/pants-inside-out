const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const uuid = require('uuid/v4');

const resolvers = {
  Query: {
    get: (_, { id }, context, info) => {
      return context.prisma.query.blobs(
        {
          where: {
            id,
          },
        },
        info
      );
    },
  },
  Mutation: {
    add: (_, { publicKey, data, encrypted, encryption }, context, info) => {
      const id = uuid();
      return context.prisma.mutation.createBlob(
        {
          where: {
            user: {
              publicKey,
            },
          },
          data: {
            user: {
              upsert: {
                data: {
                  id,
                },
              },
            },
            id,
            data,
            encrypted,
            metadata: {
              data: {
                id,
                encryption,
              },
            },
          },
        },
        info
      );
    },
    update: (_, { publicKey, id, data, encrypted, links }, context, info) => {
      return context.prisma.mutation.updateBlob(
        {
          where: {
            user: {
              publicKey,
            },
            id: id,
          },
          data: {
            data,
            encrypted,
            metadata: {
              data: {
                encryption,
                connect: {
                  links: links.map(blobId => ({ id: blobId })),
                },
              },
            },
          },
        },
        info
      );
    },
    delete: (_, { publicKey, id }, context, info) => {
      return context.prisma.mutation.deleteBlob(
        {
          where: {
            user: {
              publicKey,
            },
            id: args.id,
          },
        },
        info
      );
    },
    newUser: (_, { publicKey }, context, info) => {
      return context.prisma.mutation.createUser(
        {
          data: {
            publicKey,
            limit: 500,
            used: 0,
            data: [],
          },
        },
        info
      );
    },
  },
};

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466',
    }),
  }),
});
server.start(() => console.log(`GraphQL server is running on http://localhost:4000`));
