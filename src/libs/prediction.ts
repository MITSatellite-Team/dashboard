const tawhiriUrl = 'https://api.v2.sondehub.org/tawhiri'

export async function predict(latitude: number, longitude: number, altitude: number, datetime: string, ascentRate: number, burstAltitude: number, descentRate: number): Promise<any> {
    if(longitude < 0) longitude += 360

    const query = new URLSearchParams({
        "launch_latitude": latitude.toString(),
        "launch_longitude": longitude.toString(),
        "launch_altitude": altitude.toString(),
        "launch_datetime": datetime,
        "ascent_rate": ascentRate.toString(),
        "burst_altitude": burstAltitude.toString(),
        "descent_rate": descentRate.toString(),
    }).toString();

    const response = await fetch(`${tawhiriUrl}?${query}`)
    const json = await response.json()

    return json
}