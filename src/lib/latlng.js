export function distanceBetweenCoordinate(c1, c2) {
    const lat1 = c1.latitude;
    const lat2 = c2.latitude;
    const lon1 = c1.longitude;
    const lon2 = c2.longitude;
    const R = 6371009;
    const dLat = deg2rad(lat2-lat1);  // deg2rad below
    const dLon = deg2rad(lon2-lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    return d;
}
  
function deg2rad(deg) {
    return deg * (Math.PI/180)
}