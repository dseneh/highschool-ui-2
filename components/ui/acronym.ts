export default function acronym(name = '', maxLength = 2) {
    const shortName = name.match(/\b(\w)/g)

    if (shortName) {
        return shortName.join('').substring(0, maxLength)
    }

    return name
}
