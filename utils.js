const removeNullUndefined = (object) => {
    // this version handles empty arrays and nested empty objects
    // taken from https://stackoverflow.com/a/52368116
    // added a check to remove updatedAt if that is the only updated key
    Object
        .entries(object)
        .forEach(([k, v]) => {
            if (v && typeof v === 'object') {
                removeNullUndefined(v);
            }
            if (v && typeof v === 'object' && !Object.keys(v).length || v === null || v === undefined) {
                if (Array.isArray(object)) {
                    object.splice(k, 1);
                } else {
                    delete object[k];
                }
            }
        });
    if (Object.keys(object).length === 1 && object.updatedAt) {
        delete object.updatedAt
    }
    if (Object.keys(object).length === 1 && object._id) {
        delete object._id
    }
    return object;
}

const ObjectsDifference = (Object1, Object2) => {
    const result = {}

    Object1 = Object1 || {}
    Object2 = Object2 || {}

    if (Object.is(Object1, Object2)) { return undefined }
    else if (!Object2 || typeof Object2 !== 'object') { return Object2 }

    if (Array.isArray(Object1) || Array.isArray(Object2)) {
        const res = []
        Array.isArray(Object1) ? Object1?.sort((a, b) => new Date(a?.createdAt) - new Date(b?.createdAt)) : null
        Array.isArray(Object2) ? Object2?.sort((a, b) => new Date(a?.createdAt) - new Date(b?.createdAt)) : null
        let i = 0
        while (i < Object1?.length || i < Object2?.length) {
            if (i >= Object1?.length) {
                res.push(Object2[i])
            } else if (i >= Object2?.length) {
                res.push(Object1[i])
            } else {
                let dif = ObjectsDifference(Object1[i], Object2[i])

                if (![null, undefined, ''].includes(dif) && Object.keys(dif).length > 0) {
                    res.push(dif)
                }
            }
            i++
        }
        return res.length > 0 ? res : null
    } else {
        [...new Set(Object
            .keys(Object1 || {})
            .concat(Object.keys(Object2 || {})))]
            .forEach(key => {
                if (key === '_id') { result[key] = Object2[key] }
                else {
                    if (Object2[key] !== Object1[key] && !Object.is(Object1[key], Object2[key])) { result[key] = Object2[key] }
                    if (typeof Object2[key] === 'object' && typeof Object1[key] === 'object') {
                        const value = ObjectsDifference(Object1[key], Object2[key])
                        if (value !== undefined) { result[key] = value }
                    }
                }
            })
        return removeNullUndefined(result)
    }
}

module.exports = {ObjectsDifference}