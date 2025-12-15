import './Header.css'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import icon from "../../assets/icon.png";
import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../Types/userType';

type HeaderProps = {
    isLogged: boolean | null,
    setIsLogged: any,
    user: User,
    setUser: any
}

function Header({ isLogged, setIsLogged, user, setUser }: HeaderProps) {
    const nav = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        setIsLogged(false);
        setUser({id:"", firstname:"", lastname:"", email:"", isadmin:false});
        nav("/login");
    };

    return (
        <>
            <Navbar className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand><img src={icon} id="iconHeader" alt="icon" />Easy Travel</Navbar.Brand>
                    <Navbar.Toggle />
                    {
                        isLogged &&
                        <Dropdown>
                            <Dropdown.Toggle variant="Secondary" id="dropdown-basic" className="justify-content-end">
                                Signed in as: <span>{user.firstname + ' ' + user.lastname}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleLogout}>Log-out</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    }
                </Container>
            </Navbar>
        </>
    )
}

export default Header;
