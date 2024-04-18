const imageConfigDefault = {
    quality: 80,
    domains: ['mars.nasa.gov', 'mars.jpl.nasa.gov', 'https://i.annihil.us/'],
    format: ['avif', 'webp'],
    screens: {
        'xs': 600,
        'sm': 960,
        'md': 1280,
        'lg': 1920,
        'xl': 2400,
    },
}

const netflifyImageConfig = {
    provider: 'netlify',
    netlify: {
        baseURl: process.env.IMAGES_URL,
    },
    ...imageConfigDefault
}


const imageConfig = process.env.NODE_ENV === 'development' ? imageConfigDefault : netflifyImageConfig

export default imageConfig
