import { ListObjectsV2Command, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { BucketReference, GithubRepoInfo, StringMap } from "./interface";

const s3Client = new S3Client({ apiVersion: "2006-03-01" });
const BUCKET_NAME = process.env.BUCKET_NAME || ''

export const extractRepoBranchFromGithubEvent = (parsedEvent: any): GithubRepoInfo => {
  const repository = parsedEvent['repository']['name']
  const branch = parsedEvent['ref'].split("/")[2]
  // console.log(`repository: ${repository}, branch: ${branch}`)

  return { repository: repository, branch: branch }
}

export const getFilesFromCommit = (commit: StringMap): string[] => {
  return [].concat(commit["added"], commit["removed"], commit["modified"]);
}

export const getFilesFromCommits = (commits: StringMap[] ): string[] => {
  return commits.reduce<string[]>( (acc, commit) => { return acc.concat(getFilesFromCommit(commit)) }, [] as string[] );
}
export const getUniqueFilesFromGithubEvent = (parsedEvent: any ): string[] => {
  const files = getFilesFromCommits(parsedEvent["commits"]);
  const uniqueFiles = files.filter((value, index, array) => array.indexOf(value) === index);
  
  return uniqueFiles;
}

export const codepipelinesToTrigger = (parsedEvent: any, configs: StringMap[]): string[] => {
  // function that evaluates against all configs
  let codepipelines: string[] = [];
  const uniqueFiles = getUniqueFilesFromGithubEvent(parsedEvent);
  configs.forEach( (config) => {
    if (doFilesMatchConfig(config, uniqueFiles))
      codepipelines.push(config["codepipeline"])
  })
  return codepipelines; 
}

export const doFilesMatchConfig = (config: StringMap, files: string[]): boolean => {
  // function that determines if the files match the rules in a config
  // console.log("config " + config["match_patterns"]);
  const match_expression = config["match_patterns"].join('|')
  const ignore_expression = config["ignore_patterns"].join('|')
  // console.log("match_regex " + match_expression);
  const match_regex = new RegExp(match_expression);
  const ignore_regex = new RegExp(ignore_expression);
  
  const doFilesMatch = files.map((file) => {
    // console.log("file " + file)
    if (ignore_expression == "") {
      const match = match_regex.test(file);
      // console.log("return " + match)
      return match;
    }
    else if ( match_regex.test(file) && !ignore_regex.test(file) ) {
      // console.log("return true")
      return true;
    }
    else {
      // console.log("return false")
      return false;
    }
  })

  const match = doFilesMatch.reduce((acc, doesFileMatch) => {
    if (acc) { // if the acc becomes true, then always return true (ie. there is one file that match)
      return true;
    }
    return doesFileMatch;
  }, false)

  return match;
}


export const fetchConfigs = async (githubRepoInfo: GithubRepoInfo) : Promise<StringMap[]> => {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: `${githubRepoInfo.repository}/${githubRepoInfo.branch}`
  });

  const response = await s3Client.send(command);
  let configs: StringMap[];

  console.log(`fetchConfigs response: ${JSON.stringify(response)}`)

  if ("Contents" in response) {
    configs = await Promise.all(
      response["Contents"]?.map( async(content) => { 
       const str = await fetchConfig(String(content["Key"]))
       console.log(`inside map: ${str}`) 
       return JSON.parse(str);
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