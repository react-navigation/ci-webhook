const micro = require('micro');
const Octokat = require('octokat');

function extractIssueNumber(url) {
  let urlParts = url.split('/');
  return parseInt(urlParts[urlParts.length - 1], 10);
}

function expoUrlForCommit(commit) {
  return `https://expo.io/@react-navigation-ci/NavigationPlayground?release-channel=${commit}`;
}

const octo = new Octokat({
  username: 'react-navigation-ci',
  password: process.env.GITHUB_PASSWORD,
});

const server = micro(async (req, res) => {
  const json = await micro.json(req);
  const commit = json.payload.pull_requests[0].head_sha;
  const issueId = extractIssueNumber(json.payload.pull_requests[0].url);
  const expoUrl = expoUrlForCommit(commit);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    expoUrl
  )}`;
  const body = `NavigationPlayground for ${commit} has been deployed.\n\n![](${qrCodeUrl})\n${expoUrl}`;

  await octo
    .repos('react-navigation', 'react-navigation')
    .issues(issueId)
    .comments.create({ body });

  return 'ok';
});

server.listen(3000);
