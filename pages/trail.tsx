import { useState } from "react";

const ParcelJourney = () => {
  const [journey, setJourney] = useState([
    { step: "Parcel picked up from sender", date: "01/01/2022" },
    { step: "In transit to sorting facility", date: "01/02/2022" },
    { step: "Sorted and dispatched to delivery facility", date: "01/03/2022" },
    { step: "Out for delivery", date: "01/04/2022" },
    { step: "Delivered", date: "01/05/2022" },
  ]);

  return (
    <div>
      <h2>Parcel Journey</h2>
      <ul>
        {journey.map((step, index) => (
          <li key={index}>
            <p>{step.step}</p>
            <p>{step.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParcelJourney;
