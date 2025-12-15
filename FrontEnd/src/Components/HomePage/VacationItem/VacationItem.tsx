import "./vacationItem.css";
import Card from 'react-bootstrap/Card';
import type { followersPerVacation, vacation } from "../../../Types/vacationType";
import type { User } from "../../../Types/userType";
import Button from 'react-bootstrap/Button';
import { deleteVacation, toggleFollow } from "../../../Services/vacationApi";
import { useEffect, useState } from "react";
import EditVacationModal from "../EditVacationModal/EditVacationModal";
import ConfirmModal from "../../ConfirmModal/ConfirmModal";

function VacationItem({ vacations, user, followers, setVacations, getVacations }: { vacations: vacation[], user: User, followers: followersPerVacation[], setVacations: any, getVacations: any }) {
    const [followersState, setFollowersState] = useState<followersPerVacation[]>([]);
    const [showModalEvacation, setShowModalEvacation] = useState<boolean>(false);

    const [showConfirm, setShowConfirm] = useState(false);

    const [vacationEdit, setVacationEdit] = useState<vacation>();

    const [vacationToDelete, setVacationToDelete] = useState<number | null>(null);

    const [alert, setAlert] = useState({ show: false, type: "", message: "" });
    const showAlert = (type: any, message: any) => {
        setAlert({ show: true, type, message });

        setTimeout(() => {
            setAlert({ show: false, type: "", message: "" });
        }, 3000);
    };

    function handelFollow(vid: string, isFollow: boolean) {
        toggleFollow(user.id, vid, isFollow).then(() => {
            setFollowersState(prev =>
                prev.map(f => f.id === vid ? {
                    ...f,
                    isuserfollowing: isFollow,
                    followerscount: isFollow
                        ? Number(f.followerscount) + 1
                        : Number(f.followerscount) - 1
                } : f
                )
            );
        })
    }

    useEffect(() => {
        setFollowersState([...followers]);
    }, [followers])

    const handleClickDeleteVacation = (vid: number) => {
        deleteVacation(vid).then(() => {
            setVacations([...vacations.filter(v => Number(v.id) !== vid)]);

            setShowConfirm(false);
            showAlert("success", "Vacation deleted!");
        }).catch(() => {
            showAlert("danger", "Vacation not deleted..");
        });
    }

    return (
        <>
            {vacations && vacations.length > 0 ? (
                vacations.map((vacation: vacation) => (
                    <Card className="custom-card" key={vacation.id}>
                        <Card.Img variant="top" src={vacation.imagefilename} className="imgCard" alt="image_Vacation" />
                        <Card.Body className="card-body">
                            <div className="titleAndPrice">
                                <Card.Title className="card-title">{vacation.destination}</Card.Title>
                                <span className="card-price"> {vacation.price}$ </span>
                            </div>

                            <Card.Text className="scroll-text">
                                {vacation.description}
                            </Card.Text>

                            <Card.Text className="card-time">
                                <b>Start Date:</b> <span>{new Date(vacation.startdate).toLocaleDateString()}</span>
                                <br />
                                <b>End Date:</b> <span>{new Date(vacation.enddate).toLocaleDateString()}</span>
                            </Card.Text>

                            {user.isadmin ? (
                                <div className="card-butAction-manage">
                                    <Button variant="warning" onClick={() => { setShowModalEvacation(true); setVacationEdit({ ...vacation }) }}>Edit</Button>
                                    <Button variant="danger" onClick={() => { setVacationToDelete(Number(vacation.id)); setShowConfirm(true); }}>Delete</Button>
                                </div>
                            ) : (
                                (() => {
                                    const followerInfo = followersState.find(f => f.id === vacation.id);
                                    const isFollow = followerInfo?.isuserfollowing || false;
                                    return (
                                        <div className="card-follower">
                                            <div className="card-countFollowering">
                                                Followers: <span className="card-countFollowingValue">
                                                    {followerInfo?.followerscount || 0}
                                                </span>
                                            </div>

                                            {isFollow ? (
                                                <button className="card-butFollower" onClick={() => { handelFollow(vacation.id, false) }}> ✓ Following </button>
                                            ) : (
                                                <button className="card-butUnFollower" onClick={() => { handelFollow(vacation.id, true) }}> Follow </button>
                                            )}
                                        </div>
                                    );
                                })()
                            )}
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <div>
                    <h5>No vacations to show</h5>
                </div>
            )}

            <EditVacationModal
                setShowModalEvacation={setShowModalEvacation}
                showModalEvacation={showModalEvacation}
                getVacations={getVacations}
                vacationEdit={vacationEdit}
            ></EditVacationModal>
            
            {alert.show && (
                <div className={`alert alert-${alert.type} position-fixed bottom-0 end-0 m-4 shadow`} style={{ zIndex: 9999 }}>
                    {alert.message}
                </div>
            )}

            <ConfirmModal
                show={showConfirm}
                onConfirm={() => {
                    if (vacationToDelete !== null) handleClickDeleteVacation(vacationToDelete);
                }}
                onCancel={() => setShowConfirm(false)}
                message="Are you sure you want to delete the vacation?"
            />
        </>
    );
}

export default VacationItem;