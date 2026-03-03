import { Box } from 'lucide-react'
import React from 'react'
import Button from './ui/Button';
import { useOutlet, useOutletContext } from 'react-router';
import type { AuthContext } from '../app/root';


const Navbar = () => {
    const {isSignedIn, userName, signIn, signOut} = useOutletContext<AuthContext>();

    const handleAuthClick = async () => {
        if(isSignedIn){
            try{
                await signOut();
            }catch (e) {
                console.error(`Puter sign out Failed: ${e}`); 
            }

            return;
        }

        try{
            await signIn();
        }catch (e){
            console.error(`Puter sign in Failed: ${e}`);
        }
    };
return (
    <header className='navbar'>
        <nav className='inner'>
            <div className='left'>
                <div className='brand'>
                    <Box  className='logo'/>
                    <span className='name'>
                        Roomify 
                    </span>
                </div>

                <ul className='links'>
                    <li><a href="#">Product</a></li>
                    <li><a href="#">Pricing</a></li>
                    <li><a href="#">Community</a></li>
                    <li><a href="#">Enterprises</a></li>
                </ul>
            </div>

            <div className='actions'>
                {isSignedIn ?(
                    <>
                    <span className='greeting'>
                        {userName ? `Hi, ${userName}` : "Signed In"}
                    </span>

                    <Button size='sm' onClick={handleAuthClick} className='btn cursor-pointer'>
                        Log Out
                    </Button>
                    </>
                ): (
                    <>
                <Button size="sm" variant="ghost" className='cursor-pointer' onClick={handleAuthClick}>
                Log In
                </Button>
                <a href="#upload" className='cta '>
                    Get Started
                </a>

                </>
                )
            }
                
            </div>
        </nav>
    </header>
)
}

export default Navbar
