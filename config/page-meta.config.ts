import { Metadata } from 'next'

const pageMeta: Metadata = {
    title: {
        template: '%s • EzySchool',
        default: 'EzySchool',
      },
    description:
        'EzySchool is a comprehensive school management system designed to streamline administrative tasks, enhance communication, and improve the overall educational experience for students, teachers, and parents.',
    icons: {
        icon: [
            { url: '/img/logo-light-streamline.png' },
            {
                url: '/img/logo-dark-streamline.png',
                media: '(prefers-color-scheme: dark)',
            },
        ],
    },
}

export default pageMeta
