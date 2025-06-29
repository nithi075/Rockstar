import bannerImage from '../assets/img/b2.jpg';
import { Link } from 'react-router-dom';
export default function Banner(){
    return (
        <section className="banner" id="sectio-p1" >
        <div style={ {backgroundImage: `url(${bannerImage})`} }>
            <h5>Our Services</h5>
        <h2>Trendy <span>Outfits</span> in Affordable Prices</h2>
       <Link to='/shop'> <button class="normal">Explore More</button></Link>
        </div>
       
    </section>
    )
}