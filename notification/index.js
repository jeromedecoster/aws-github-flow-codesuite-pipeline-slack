const https = require('https')

exports.handler = (event) => {
    
  let sns = JSON.parse(event.Records[0].Sns.Message)

  let data = ''
  if (sns.source == 'aws.codepipeline') {
    data = createCodepipelineData(sns)
  } else if (sns.source == 'aws.codebuild') {
    data = createCodebuildData(sns)
  }

  let options = {
    hostname: 'hooks.slack.com',
    port: 443,
    path: process.env.SLACK_PATH,
    method: 'POST',
  }

  let req = https.request(options, (res) => {
    console.log('status code : ' + res.statusCode)
    res.setEncoding('utf8')
    res.on('data', (d) => {
      console.log(d)
    })
  })

  req.on('error', (e) => {
    console.error(e)
  })

  req.write(data)
  req.end()
}

const createCodebuildData = (sns) => {
  let region = ''
  let time = ''
  let phase = ''
  let status = ''
  let project = ''
  let location = ''
  let stream = ''
  let logs = ''
  try {
    region = sns.region
    time = sns.time.replace('T', ' ').replace('Z', '')
    phase = sns.detail['completed-phase']
    status = sns.detail['build-status']
    project = sns.detail['project-name']
    location = sns.detail['additional-information'].source.location
    stream = sns.detail['additional-information'].logs['stream-name']
    logs = sns.detail['additional-information'].logs['deep-link']
  } catch(err) {}

  let username = `CodeBuild - ${time}`
  let url_source = location.replace('.git', '')
  let url_logs = `https://${region}.console.aws.amazon.com/codesuite/codebuild/projects/${project}/build/${project}%3A${stream}/log`
  
  let data = {
    username: username,
    text: phase,
    icon_emoji: ':bell:',
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `CodeBuild <https://${region}.console.aws.amazon.com/codesuite/codebuild/projects/${project}|${project}> status: *${status}*`
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Open CodeBuild"
            },
            url: `https://${region}.console.aws.amazon.com/codesuite/codebuild/projects/${project}`
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Open Github"
            },
            url: `${url_source}`
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Open CodeBuild Logs"
            },
            url: `${url_logs}`
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Open CloudWatch Logs"
            },
            url: `${logs}`
          }
        ]
      }
    ]
  }

  return JSON.stringify(data)
}

const createCodepipelineData = (sns) => {
  let time = sns.time.replace('T', ' ').replace('Z', '')
  let username = `CodePipeline - ${time}`
  let region = sns.region
  let pipeline = sns.detail.pipeline
  let link = `https://${region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline}/view`
  let text = `status: *${sns.detail.state}* ${link}`
  
  let icon_emoji = ':bell:'
  if (sns.detail.state == 'SUCCEEDED') icon_emoji = ':tada:'
  else if (sns.detail.state == 'FAILED') icon_emoji = ':boom:'
  
  let data

  // simplest message
  /*
  data = JSON.stringify({
    username: username,
    text: text,
    icon_emoji: icon_emoji
  })
  */

  // with image
  /*
  let image = 'https://data.photofunky.net/output/image/c/6/6/c/c66c9f/photofunky.gif'
  if (sns.detail.state == 'SUCCEEDED') image = 'https://data.photofunky.net/output/image/e/6/b/0/e6b0d8/photofunky.gif'
  else if (sns.detail.state == 'FAILED') image = 'https://data.photofunky.net/output/image/c/2/1/2/c21293/photofunky.gif'

  data = JSON.stringify({
    username: username,
    text: text,
    icon_emoji: icon_emoji,
    attachments:[{
      image_url: image
    }]
  })
  */

  // more complex message
  let json_attr = null
  if (Object.keys(sns.additionalAttributes).length) {
    json_attr = JSON.stringify(sns.additionalAttributes, null, 2)
  } 
  
  /*
  let color = '#0000ff'
  if (sns.detail.state == 'SUCCEEDED') color = '#00ff00'
  else if (sns.detail.state == 'FAILED') color = '#ff0000'
  
  data = JSON.stringify({
    username: username,
    text: text,
    icon_emoji: icon_emoji,
    attachments: [{
        color: color,
        title: pipeline,
        title_link: link,
        text: json_attr
      }]
  })
  */

  // best message
  let obj = {
    username: username,
    text: sns.detailType,
    icon_emoji: icon_emoji,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `CodePipeline <https://${region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline}/view|${pipeline}> status: *${sns.detail.state}*`
        }
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Open Pipeline"
            },
            url: `https://${region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline}/view`
          }
        ]
      }
    ]
  }
  if (json_attr != null) {
    obj.attachments = [
      {
        color: color,
        title_link: `https://${region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline}/view`,
        text: json_attr
      }
    ]
  }

  return JSON.stringify(obj)
}