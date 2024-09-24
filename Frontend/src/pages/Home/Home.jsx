import React from "react";
import { useNavigate } from "react-router-dom";
import { Parallax } from "react-parallax";
import "./home.css";
import backgroundImage from "./g7.jpg"; 
import videoSrc from '../../assets/images/video2.mp4'; 
import { SearchBar } from "../../components/SearchBar/SearchBar";
import FeaturedTourList from "../../components/Featured-tours/FeaturedTourList";
import MasonryImagesGallery from "../../components/imagegallery/MansonryImagesGallery";

const Home = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleNavigateHome = () => {
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth', 
    });
};


  return (
    <>
      <div className="container">
        <div className="video-section">
          <video className="background-video" autoPlay loop muted>
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay">
            <h1>Pack Your Bags</h1></div>
        </div>

        <SearchBar />

        {/* Why Choose Us Section */}
        <div className="why-choose-us-section">
          <h2 className="why-choose-us-heading">Why Choose Us?</h2>
          <div className="why-choose-us-container">
            <div className="why-choose-us-box">
              <i className="fas fa-award"></i>
              <h3>20+ Year Experience</h3>
              <p>
                Boasting over two decades in the tourism and hospitality industry, Tour My India has amassed invaluable experience that sets us apart.
              </p>
            </div>

            <div className="why-choose-us-box">
              <i className="fas fa-users"></i>
              <h3>A Team of Experts</h3>
              <p>
                Our experienced team is more than just proficient; they are destination experts for every location within the mesmerizing landscape of India.
              </p>
            </div>

            <div className="why-choose-us-box">
              <i className="fas fa-rupee-sign"></i>
              <h3>Value for Money Tours</h3>
              <p>
                Our holiday packages are designed with a focus on value for money, ensuring unforgettable experiences that make every moment worthwhile.
              </p>
            </div>
          </div>
        </div>



        <Parallax
          strength={500}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
          }}
        >
          <section className="parallax">
            <div className="parallax-content">
              <div className="parallax-text">
                <p>Discover the world's most exciting destinations</p>
                <button className="explore-button" onClick={handleNavigateHome}>Explore Now</button>
              </div>
              <h1>Your Next Travel Adventure Awaits</h1>
            </div>
          </section>
        </Parallax>

        <FeaturedTourList />
       
      <h3 className="section_subtitle"> GALLERY</h3>
                  <p className="gallery_title">
                    Visit Our Customers Tour Gallery
                    </p>

        <MasonryImagesGallery />
      </div>
    </>
  );
};

export default Home;
