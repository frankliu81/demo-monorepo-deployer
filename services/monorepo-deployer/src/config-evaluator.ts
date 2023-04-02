import { ListObjectsV2Command, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { BucketReference, GithubRepoInfo } from "./interface";

const s3Client = new S3Client({ apiVersion: "2006-03-01" });
const BUCKET_NAME = process.env.BUCKET_NAME || ''

export const extractRepoBranchFromGithubEvent = (parsedEvent: any): GithubRepoInfo => {
  const repository = parsedEvent['repository']['name']
  const branch = parsedEvent['ref'].split("/")[2]
  console.log(`repository: ${repository}, branch: ${branch}`)

  return { repository: repository, branch: branch }
}

export const fetchConfigs = async (githubRepoInfo: GithubRepoInfo) : Promise<string[]> => {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${githubRepoInfo.repository}/${githubRepoInfo.branch}`
  });

  const response = await s3Client.send(command);
  let configs: string[];

  console.log(`fetchConfigs response: ${JSON.stringify(response)}`)

  if ("Contents" in response) {
    configs = await Promise.all(
      response["Contents"]?.map( async(content) => { 
       const str = await fetchConfig(String(content["Key"]))
       console.log(`inside map: ${str}`) 
       return str;
      }) || []
    )

    console.log(`fetchConfigs configs: ${configs}`)
  }

  return new Promise((resolve) => {
    resolve(configs);
})
}

export const fetchConfig = async (key: string) : Promise<string> => {
  console.log(`fetchConfig key: ${key}`)

  return getObject({
    Bucket: BUCKET_NAME,
    Key: key
  });
}

export const getObject = async (bucket: BucketReference): Promise<string> => {
    const command = new GetObjectCommand(bucket);

    let str = '{}';

    try {
        const response = await s3Client.send(command);
        // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        str = await response.Body!.transformToString();
        console.log(`getObject ${str}`);
    } catch (err) {
        console.error(err);
    }

    return new Promise((resolve) => {
        resolve(str);
    })
}