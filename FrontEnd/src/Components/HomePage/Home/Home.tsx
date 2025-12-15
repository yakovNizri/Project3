import "./Home.css";
import VacationItem from "../VacationItem/VacationItem";
import { useEffect, useState } from "react";
import { getVacationsPaged } from "../../../Services/vacationApi";
import type { followersPerVacation, vacation, vacationsSortBy } from "../../../Types/vacationType";
import type { User } from "../../../Types/userType";
import Pagination from "react-bootstrap/Pagination";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import NewVacationModal from "../NewVacationModal/NewVacationModal";
import ReportVacationModal from "../ReportVacationModal/ReportVacationModal";

function Home({ user }: { user: User }) {
    const [showModalNvacation, setShowModalNvacation] = useState<boolean>(false);
    const [showModalReportVacation, setShowModalReportVacation] = useState<boolean>(false);

    const [vacations, setVacations] = useState<vacation[]>([]);
    const [followers, setFollowers] = useState<followersPerVacation[]>([]);
    const [paramPagination, setParamPagination] = useState<{ page: number, limit: number, totalPages: number }>({ page: 1, limit: 10, totalPages: 0 });
    const [paramSortBy, setParamSortBy] = useState<vacationsSortBy>({ userVaca: false, upcomingVaca: false, activeVaca: false });

    function getVacations() {
        getVacationsPaged(paramPagination.page, paramPagination.limit, paramSortBy).then((res) => {
            setVacations([...res.vacations]);
            setFollowers([...res.followers]);
            setParamPagination({ ...{ page: res.page, limit: res.limit, totalPages: res.totalPages } });

            window.scrollTo({ top: 0, behavior: "smooth" });
        })
    }

    useEffect(() => {
        getVacations();
    }, [paramPagination.page, paramSortBy]);

    const goPrev = () => {
        if (paramPagination.page > 1)
            setParamPagination({ ...paramPagination, ['page']: paramPagination.page - 1 });
    };

    const goNext = () => {
        if (paramPagination.page < paramPagination.totalPages)
            setParamPagination({ ...paramPagination, ['page']: paramPagination.page + 1 });
    };

    const sortByValue = (field?: keyof vacationsSortBy) => {
        setParamSortBy({
            userVaca: false,
            upcomingVaca: false,
            activeVaca: false,
            ...(field ? { [field]: true } : {})
        });
        field ? setParamPagination(prev => ({ ...prev, ["page"]: 1 })) : "";
    };

    const getTitle = () => {
        if (paramSortBy.userVaca) return "Following";
        if (paramSortBy.upcomingVaca) return "Upcoming";
        if (paramSortBy.activeVaca) return "Active";
        return "All";
    };

    return (
        <>
            <div id="container-hedaerHome">
                <div id="sortBy">
                    <DropdownButton id="dropdown-basic-button" variant="info" title={getTitle()}>
                        <Dropdown.Item onClick={() => sortByValue()}>All</Dropdown.Item>
                        <Dropdown.Item onClick={() => sortByValue("userVaca")}>Following</Dropdown.Item>
                        <Dropdown.Item onClick={() => sortByValue("upcomingVaca")}>Upcoming</Dropdown.Item>
                        <Dropdown.Item onClick={() => sortByValue("activeVaca")}>Active</Dropdown.Item>
                    </DropdownButton>
                </div>

                {user.isadmin &&
                    <div className="d-flex gap-2">
                        <Button variant="primary" onClick={() => setShowModalReportVacation(true)}>Report Vacation</Button>
                        <Button variant="primary" onClick={() => setShowModalNvacation(true)}>New Vacation</Button>
                    </div>
                }
            </div >


            <div id="container-vacation">
                <VacationItem vacations={vacations} setVacations={setVacations} user={user} followers={followers} getVacations={getVacations}></VacationItem>
            </div>


            <div id="container-Pagination">
                <Pagination className="d-flex align-items-center gap-3">

                    <Pagination.Prev disabled={paramPagination.page === 1} onClick={goPrev} />

                    <span id="pagedOfTotal">
                        Page {paramPagination.page} of {paramPagination.totalPages}
                    </span>

                    <Pagination.Next disabled={paramPagination.page === paramPagination.totalPages} onClick={goNext} />

                </Pagination>
            </div>

            <NewVacationModal showModalNvacation={showModalNvacation} setShowModalNvacation={setShowModalNvacation} getVacations={getVacations}></NewVacationModal>
            <ReportVacationModal showModalReportVacation={showModalReportVacation} setShowModalReportVacation={setShowModalReportVacation}></ReportVacationModal>
        </>
    )
}
export default Home;