import type { AuthConfig } from "@auth/core";
import Discord from "@auth/core/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise, { secretClient } from "src/db";

export default {
  providers: [
    Discord({
      clientId: (await secretClient.getSecret("discordClientId")).value!,
      clientSecret: (await secretClient.getSecret("discordClientSecret"))
        .value!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user = user;
      return session;
    },
    redirect({ url }) {
      return url;
    },
  },
  adapter: MongoDBAdapter(clientPromise, { databaseName: "userdata" }),
} as AuthConfig;
