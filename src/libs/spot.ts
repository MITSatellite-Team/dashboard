const spotUrl = 'https://api.findmespot.com/spot-main-web/consumer/rest-api/2.0/public/feed/0iuZf7fGrERZ5NX1pXcVpB7BqysYAQoWu/message.json'

export async function getSpot(): Promise<any> {
    const response = await fetch(spotUrl)
    const json = await response.json()

    return json
}