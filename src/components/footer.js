import linkedInLogo from './../assets/images/linkedInLogo.svg'
import twitterLogo from './../assets/images/twitterLogo.svg'
import facebookLogo from './../assets/images/facebookLogo.svg'
import instagramLogo from './../assets/images/instagramLogo.svg'
import './../assets/styles/footer.scss'

export const Footer = () => {
    return (
        <div className="footer-div">
            <div className="footer">
                <p>© 2021, Muthu </p>
                <div className="logos">
                    <a href='https://www.linkedin.com/in/muthukumaraswamy-b-08894369/' target="_blank" rel='noreferrer'><img src={linkedInLogo} alt='linkedInLogo'/></a>
                    <img src={facebookLogo} alt='facebookLogo'/>
                    <img src={twitterLogo} alt='twitterLogo'/>
                    <img src={instagramLogo} alt='instagramLogo'/>
                </div>
            </div>
        </div>
    )
}