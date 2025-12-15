import { useEffect, useRef } from "react";
import "./ReportVacationModal.css";
import { Modal, Button } from "react-bootstrap";
import Chart from "chart.js/auto";
import { reportFileCSVvacation, reportVacation } from "../../../Services/vacationReportApi";

interface Props {
    setShowModalReportVacation: (show: boolean) => void;
    showModalReportVacation: boolean;
}

function ReportVacationModal({ setShowModalReportVacation, showModalReportVacation }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (!showModalReportVacation) return;

        reportVacation().then(res => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;

            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            chartInstance.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: res.map(v => v.destination),
                    datasets: [
                        {
                            label: "Number of followers",
                            data: res.map(v => Number(v.followers ?? 0)),
                            backgroundColor: "rgba(54, 162, 235, 0.5)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                            barPercentage: 0.5,
                            categoryPercentage: 0.5

                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: "Follow by vacation destination"
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                stepSize: 1,
                                callback: function (value) {
                                    return Number(value);
                                }
                            }
                        }
                    }
                }
            });
        });

    }, [showModalReportVacation]);

    const handleClose = () => {
        setShowModalReportVacation(false);
    }

    const handleDownloadRepoVacation = async () => {
        const link = await reportFileCSVvacation()
        const url = window.URL.createObjectURL(link.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "vacation-report.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    }

    return (
        <Modal show={showModalReportVacation} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Followers graph by vacations</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <canvas ref={canvasRef} id="canvaReport"></canvas>
            </Modal.Body>

            <Modal.Footer className="d-flex justify-content-between">
                <a id="exportFileCSV" className="me-3" title="download file" onClick={handleDownloadRepoVacation}>Export</a>

                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ReportVacationModal;
