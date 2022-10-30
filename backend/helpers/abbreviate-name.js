const abbreviateName = name => {
    const names = name
        .toString()
        .replace(/\ dos|\ das|\ dos|\ das|\ da|\ de|\ d\'/gi, '')
        .split(' ')

    const firstName = names[0]

    const surname = names
        .filter((_, index) => index)
        .reduce((acc, name) => acc += ` ${name.charAt()}.`, '')
        .toUpperCase()

    return firstName+surname
}

export default abbreviateName