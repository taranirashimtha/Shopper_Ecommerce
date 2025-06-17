import React from 'react';
import './NewCollections.css';
import new_collection from '../Assets/new_collections';
import Item from '../Item/Item';

const NewCollections = () => {
  const limitedCollection = new_collection.slice(0, 4); // Only take first 4 items

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {limitedCollection.map((item, i) => (
          <Item 
            key={i} 
            id={item.id} 
            name={item.name} 
            image={item.image} 
            new_price={item.new_price} 
            old_price={item.old_price} 
          />
        ))}
      </div>
    </div>
  );
};

export default NewCollections;
