import React from 'react';
import './About.css';

const About = () => {
  const handleImageClick = (name) => {
    alert(`You clicked on ${name}`);
    // Here you can implement further actions such as routing or opening a modal
  };
  const people = [
    {
      name: 'Rohith',
      role: 'CEO',
      imgSrc: 'https://example.com/rohith-photo.jpg', // Replace with actual image URL
      link: 'https://example.com/rohith-profile', // Replace with actual link URL
    },
    {
      name: 'Vithesh',
      role: 'Creative Director',
      imgSrc: 'https://example.com/vithesh-photo.jpg', // Replace with actual image URL
      link: 'https://example.com/vithesh-profile', // Replace with actual link URL
    },
    {
      name: 'Sai Kiran',
      role: 'Event Planner',
      imgSrc: 'https://example.com/sai-kiran-photo.jpg', // Replace with actual image URL
      link: 'https://example.com/sai-kiran-profile', // Replace with actual link URL
    },
    {
      name: 'Ram Gopal',
      role: 'Photographer',
      imgSrc: 'https://example.com/ram-gopal-photo.jpg', // Replace with actual image URL
      link: 'https://example.com/ram-gopal-profile', // Replace with actual link URL
    },
    {
      name: 'Vinay',
      role: 'Catering Manager',
      imgSrc: 'https://example.com/vinay-photo.jpg', // Replace with actual image URL
      link: 'https://example.com/vinay-profile', // Replace with actual link URL
    },
  ];

  return (
    <div className="about-container">
      {/* Company Section */}
      <section className="company-section">
      <img
          src="https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=600"// Replace with your actual image URL
          alt="Logo"
          className="company-image"
        />
        <div className="story-text">
        <h2>Company</h2>
        <p>
        "Pack Your Bags" is a company that could focus on providing travel-related services such as event planning, photography, and catering, aimed at enhancing travel experiences. 
        Your website might include various sections, such as "Meet Our People," highlighting key team members like the CEO, Creative Director, Event Planner, Photographer, and Catering Manager. 
        The site could also showcase company achievements, including total subscribers, categories, bookings, and the countries you've expanded into.
        </p>
        </div>
      </section>

      <hr className="divider" />

      {/* Our Story Section */}
      <section className="story-section">
        <img
          src="https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg?auto=compress&cs=tinysrgb&w=600"// Replace with your actual image URL
          alt="Our story"
          className="story-image"
        />
        <div className="story-text">
          <h2>Our Story</h2>
          <p>
          At "Pack Your Bags," our journey began with a simple idea: making travel easier and more enriching for adventurers like you. 
          We understand that planning the perfect trip can be overwhelming—choosing where to stay, what to see, and how to make the most of your time in a new destination.
          </p>
        </div>
      </section>

      <hr className="divider" />
      {/* Company Section */}
      <section className="company-section">
      <img
          src="https://images.pexels.com/photos/6229/marketing-board-strategy.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" // Replace with your actual image URL
          alt="Stratergy"
          className="company-image"
        />
        <div className="story-text">
        <h2>Our stratergy</h2>
        <p>
      At Pack Your Bags, we’re passionate about simplifying the travel experience.
        Whether you’re planning a quick weekend getaway or an extended international trip, our platform helps you discover the best hotels and must-see attractions at your destination. 
        We curate personalized recommendations tailored to your preferences, ensuring that every journey is memorable. 
        From luxury accommodations to hidden gems off the beaten path, we guide you through the top places to stay and explore. 
        Travel smarter, travel easier—Pack Your Bags has you covered.


        </p>
        </div>
      </section>
       <hr className= "divider" />
       {/* Meet Our People Section */}
       <section className="people-section">
        <h2>Meet Our People</h2>
        <div className="people-flex">
          {people.map((person) => (
            <div key={person.name} className="person-card-flex">
              <a href={person.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={person.imgSrc}
                  alt={person.name}
                  className="person-image"
                />
              </a>
              <h3>{person.name}</h3>
              <p>{person.role}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider" />

  {/* Achievements Section */}
  <section className="achievements-section">
        <h2>Achievements</h2>
        <div className="achievements-grid">     
          <div className="achievement-item">
            <h3>500+</h3>
            <p>Total Subscribers</p>
          </div>
          <div className="achievement-item">
            <h3>100+</h3>
            <p>Categories</p>
          </div>
          <div className="achievement-item">
            <h3>250+</h3>
            <p>Bookings</p>
          </div>
          <div className="achievement-item">
            <h3>10+</h3>
            <p>Countries Expanded</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
