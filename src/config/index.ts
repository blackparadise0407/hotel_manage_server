export const isDev: boolean = process.env.NODE_ENV === 'development';
export const TOKEN_CONFIG = {
    access: {
        expire: 60 * 60 * 1,
    },
    refresh: {
        expire: 60 * 60 * 12,
        algorithm: 'RS256',
    },
};

export const BCRYPT_SALT_WORKER = 10;

export const SUCCESS = 'Success';

export const SUCCESS_CODE = 200;

export const GOOGLE =
    'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&include_granted_scopes=true&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5050%2Fauth%2Fgoogle%2Fcallback&client_id=26271358546-0fea8k8agk8m7gqeas4gc245idubl7ve.apps.googleusercontent.com&flowName=GeneralOAuthFlow';

export const UPLOAD = {
    limits: {
        fileSize: {
            image: 2 * 1024 * 1024,
        },
        maxCount: {
            image: 10,
        },
    },
    availableMime: {
        image: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/svg+xml',
            'image/tiff',
            'image/webp',
        ],
    },
};

export const CLOUDINARY = {
    cloud_name: 'dig00csrc',
    api_key: '789143575217113',
    api_secret: '7dm3F5Xtb2m4ZZofdwjkNHPMRXY',
};

export const HOST = {
    name: 'Instagram',
    url: isDev ? 'https://instagram.kyle-pham' : 'http://localhost:5050',
};

export const ROOM = {
    MAX_FLOOR: 5,
    MAX_ROOM: 6,
};
