import { extendType, objectType, nonNull, stringArg } from "nexus";

export const Link = objectType({
    name: "Link",
    definition(t): void {
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.field("postedBy", {
            type: 'User',
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({where: {id: parent.id } })
                    .postedBy();
            }
        })
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({where: {id: parent.id } })
                    .voters();
            }
        })
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed" , {
            type: "Link",
            resolve(parent, args, context, info) {
                return context.prisma.link.findMany();
            },
        }); 
    },
});

export const UniqueLinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.field("link" , {
            type: "Link",
            args: {
                id: nonNull(stringArg())
            },
            resolve(parent, args, context, info) {
                return context.prisma.link.findUnique({
                    where: {id: parseInt(args.id)}
                })
            },
        }); 
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t): void {
        t.nonNull.field("createLink", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            resolve(parent, args, context) {
                const { description, url } = args;
                const { userId } = context;

                if (!userId) {
                    throw new Error("Cannot post without logging in.");
                }
                const newLink = context.prisma.link.create({
                    data: {
                        description,
                        url, 
                        postedBy: { connect: {id: userId} }
                    },
                });
                return newLink
            }
        })
        t.nonNull.field("updateLink", {
            type: "Link",
            args: {
                id: nonNull(stringArg()),
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            resolve(parent, args, context) {
                const newLink = context.prisma.link.update({
                    where: {id: parseInt(args.id)}, 
                    data: {
                        description: args.description,
                        url: args.url
                    }
                })
                return newLink;
            }
        })
        t.nonNull.field("deleteLink", {
            type: "Link",
            args: {
                id: nonNull(stringArg()),
            },
            resolve(parent, args, context) {
                const removedLink = context.prisma.link.delete({
                    where: {id: parseInt(args.id)}
                })
                return removedLink;
            }
        })
    },
})
