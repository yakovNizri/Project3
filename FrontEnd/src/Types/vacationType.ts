export type vacationsSortBy = {
    userVaca: boolean;
    upcomingVaca: boolean;
    activeVaca: boolean;
}

export type followersPerVacation = {
    id: string;
    followerscount: number;
    isuserfollowing: boolean;
}

export type vacation = {
    id: string;
    destination: string;
    description: string;
    startdate: Date;
    enddate: Date;
    price: number;
    imagefilename: string;
}

export type newVacation = {
    destination: string;
    description: string;
    startdate: Date | string;
    enddate: Date | string;
    price: string;
    imagefilename: File | undefined;
}

export type updateVacation = {
    id: string,
    destination: string;
    description: string;
    startdate: Date | string;
    enddate: Date | string;
    price: string;
    imagefilename: File | undefined;
}

export type resultPagination = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    followers: followersPerVacation[];
    vacations: vacation[];
}

export type reportVacations = {
    destination: number,
    followers: number
}
