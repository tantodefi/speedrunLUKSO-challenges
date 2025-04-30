const fetchFromApi = ({ path, method, body }: { path: string; method: string; body?: object }) =>
  fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .catch(error => console.error("Error:", error));

export async function addToIPFS(metadata: any) {
  const result = await fetchFromApi({ path: "/api/ipfs/add", method: "Post", body: metadata });
  // Always extract the CID as a string, regardless of response shape
  let cidString = undefined;
  if (typeof result === "string") {
    cidString = result;
  } else if (result && typeof result.cid === "string") {
    cidString = result.cid;
  } else if (result && result.cid && typeof result.cid === "object" && typeof result.cid["/"] === "string") {
    cidString = result.cid["/"];
  } else if (result && typeof result["/"] === "string") {
    cidString = result["/"];
  }
  if (!cidString || typeof cidString !== "string") {
    throw new Error("Invalid IPFS response: " + JSON.stringify(result));
  }
  return { cid: cidString };
}

export const getMetadataFromIPFS = (ipfsHash: string) =>
  fetchFromApi({ path: "/api/ipfs/get-metadata", method: "Post", body: { ipfsHash } });
