import Build from "../../common/models/build";
import { getItemName } from "../client/lol-client";

export async function createMessage(build: Build): Promise<string> {
    return await getItemName(build.item0);
}