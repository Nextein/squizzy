import { config, x } from "@imtbl/sdk";

const { Environment } = config;

const {
    IMXClient,
    imxClientConfig, // helper method to create a client config
} = x;

const environment = Environment.SANDBOX; // or Environment.PRODUCTION
const client = new IMXClient(imxClientConfig({ environment }));

export default function main() {
    console.log("Starting fetch...");
}