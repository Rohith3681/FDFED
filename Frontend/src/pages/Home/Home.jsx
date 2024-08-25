import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Parallax } from "react-parallax";

import "./home.css";
import tour4 from "../../assets/images/tour/Tokyo.png";
import tour5 from "../../assets/images/tour/bali-1.png";
import tour6 from "../../assets/images/tour/bangkok.png";
import tour7 from "../../assets/images/tour/cancun.png";
import tour8 from "../../assets/images/tour/nah-trang.png";
import tour9 from "../../assets/images/tour/phuket.png";
import backgroundImage from "./g7.jpg"; // Import the background image

import { SearchBar } from "../../components/SearchBar/SearchBar";

// Custom arrow components
const CustomPrevArrow = (props) => {
  const { className, onClick } = props;
  return <button className={className} onClick={onClick}>←</button>;
};

const CustomNextArrow = (props) => {
  const { className, onClick } = props;
  return <button className={className} onClick={onClick}>→</button>;
};

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          autoplay: true,
          prevArrow: false,
          nextArrow: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          prevArrow: false,
          nextArrow: false,
        },
      },
    ],
  };

  const destinations = [
    {
      id: 0,
      name: "Bali",
      tours: "5 tours and activities",
      image: tour5,
      link: "/tour",
      location: "dehradun",
    },
    {
      id: 1,
      name: "Tokyo",
      tours: "9 tours and activities",
      image: tour4,
      link: "/tour",
      location: "Rishikesh",
    },
    {
      id: 2,
      name: "Bangkok",
      tours: "5 tours and activities",
      image: tour6,
      link: "/tour",
      location: "Mussoorie",
    },
    {
      id: 3,
      name: "Cancun",
      tours: "4 tours and activities",
      image: tour7,
      link: "/tour",
      location: "Uttarkhashi",
    },
    {
      id: 4,
      name: "Nha Trang",
      tours: "9 tours and activities",
      image: tour8,
      link: "/tour",
      location: "Manali",
    },
    {
      id: 5,
      name: "Phuket",
      tours: "4 tours and activities",
      image: tour9,
      link: "/tour",
      location: "Haridwar",
    },
  ];

  return (
    <>
      <section className="tours_section slick_slider">
        <Container>
          <Row>
            <Col md="12">
              <div className="main_heading">
                <h1>Top Destination For Your Next Vacation</h1>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <Slider {...settings}>
                {destinations.map((destination, inx) => (
                  <div className="img-box" key={inx}>
                    <Card>
                      <Card.Img
                        variant="top"
                        src={destination.image}
                        className="img-fluid"
                        alt={destination.name}
                      />
                      <Card.Title>{destination.name}</Card.Title>
                      <span className="tours">{destination.tours}</span>
                    </Card>
                  </div>
                ))}
              </Slider>
            </Col>
          </Row>
        </Container>
      </section>
      <SearchBar />
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
              <button className="explore-button">Explore Now</button>
            </div>
            <h1>Your Next Travel Adventure Awaits</h1>
          </div>
        </section>
      </Parallax>
    </>
  );
};

export default Home;
