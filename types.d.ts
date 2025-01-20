export interface ClearRedisCacheResponse {
    status: number;
    message: string;
    error?: string;
}

export interface MarsRoverPhoto {
    // Properties for single photo
    index?: number;
    sol?: number;
    camera?: {
        id: number;
        name: string;
        rover_id: number;
        full_name: string;
    };
    img_src?: string;
    earth_date?: string;
    rover?: {
        name: string;
        status: string;
        max_sol: number;
        total_photos: string;
    };

    // Properties for photo list
    landing_date?: string;
    launch_date?: string;
    cameras?: {
        name: string;
        full_name: string;
        total_photos: number;
    }[];
    entries?: {
        index: number;
        sol: number;
        camera: {
            id: number;
            name: string;
            rover_id: number;
            full_name: string;
        };
        img_src: string;
        earth_date: string;
        rover: {
            name: string;
            status: string;
            max_sol: number;
            total_photos: string;
        };
    }[];
}

interface MarvelListData {
    attributionText: string;
    results: MarvelCharacter[];
}

interface MarvelCharacter {
    id: number;
    name: string;
    modified: string;
    description: string;
    thumbnail: {
        path: string;
        extension: string;
    };
    events: {
        available: string;
    };
    stories: {
        available: string;
    };
    comics: {
        available: string;
    };
    series: {
        available: string;
    };
}

export type MarvelResult = MarvelListData | MarvelCharacter;

export interface MarvelCharacter {
    id: number;
    name: string;
    modified: string;
    description: string;
    thumbnail: {
        path: string;
        extension: string;
    };
    events: {
        available: string;
    };
    stories: {
        available: string;
    };
    comics: {
        available: string;
    };
    series: {
        available: string;
    };
}

export interface MarvelResponse {
    data: {
        results: MarvelCharacter[];
    };
    attributionText: string;
}

export interface MarvelData {
    attributionText: string;
    results: MarvelCharacter[];
}

interface RawMarsPhoto {
    id: number;
    sol: number;
    camera: {
        id: number;
        name: string;
        rover_id: number;
        full_name: string;
    };
    img_src: string;
    earth_date: string;
    rover: {
        id: number;
        name: string;
        landing_date: string;
        launch_date: string;
        status: string;
        max_sol: number;
        total_photos: number;
        cameras: {
            id: number;
            name: string;
            full_name: string;
        }[];
    };
}

export interface MarsPhotosResponse {
    photos: RawMarsPhoto[];
}

export interface MarsPhoto {
    index: number;
    sol: number;
    camera: {
        id: number;
        name: string;
        rover_id: number;
        full_name: string;
    };
    img_src: string;
    earth_date: string;
    rover: {
        name: string;
        status: string;
    };
}

export interface MarsPhotosList {
    landing_date: string;
    launch_date: string;
    cameras: { name: string; total_photos: number }[]; // Update the interface to include total_photos
    entries: MarsPhoto[]; // Assuming this should be an array of MarsPhoto objects
}

/*export interface QueryOptions<TData> {
    queryKey: [string, string | string[]] | [string];
    queryFn: () => Promise<TData>;
}*/
