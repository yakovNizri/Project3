import VacationModel from "../models/VacationModel"

export type reportVacations = {
    destination: string,
    followers: string
}

export type vacationsSortBy = {
    userVaca: boolean,
    upcomingVaca: boolean,
    activeVaca: boolean
}

export type followersPerVacation = {
    id: string,
    followerscount: string,
    isuserfollowing: boolean
}


export type resultPagination = {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    followers: followersPerVacation[],
    vacations: VacationModel[]
}