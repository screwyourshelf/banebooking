import { useEffect, useState } from 'react'

export function Hello() {
    const [message, setMessage] = useState('Laster...')

    useEffect(() => {
        fetch('/api/hello')
            .then(res => res.json())
            .then(data => setMessage(data.message))
            .catch(() => setMessage('Kunne ikke hente data'))
    }, [])

    return <p>{message}</p>
}
