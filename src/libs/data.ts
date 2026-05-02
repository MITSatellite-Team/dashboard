export type Update = {
    id: number,
    timestamp: number,

    gpsValid: boolean,
    gpsFix: number,
    latitude: number,
    longitude: number,
    altitude: number,

    temperature0Valid: boolean,
    temperature0: number,
    temperature1Valid: boolean,
    temperature1: number,
    temperature2Valid: boolean,
    temperature2: number,
    temperature3Valid: boolean,
    temperature3: number,

    baroValid: boolean,
    pressure: number,
    humidity: number,

    imuValid: boolean,
    ax: number,
    ay: number,
    az: number,
    gx: number,
    gy: number,
    gz: number,
    mx: number,
    my: number,
    mz: number,
}