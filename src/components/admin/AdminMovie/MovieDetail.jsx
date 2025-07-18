import { useParams } from "react-router-dom";
import { useState } from "react";
import { useGetMovieByIdQuery } from "@/api/movieApi";
import { formatImage } from "@/utils/formatImage";
export default function MovieDetail() {
  const { id } = useParams(); 
  const { data: movie, error, isLoading } = useGetMovieByIdQuery(id); 

  const ListMovie = movie?.movie; 

  const [isModalOpen, setIsModalOpen] = useState(false);

 
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading movie details.</div>;


  if (!ListMovie) return <div>Movie not found</div>;

  const trailerId = ListMovie?.trailer ? ListMovie.trailer.split('/').pop() : null;


  const genres = ListMovie?.MovieGenres?.map(genreRelation => genreRelation.Genre?.name).join(", ") || "No genres available";


  const directorName = ListMovie?.Director?.name || "Unknown Director";


  const actors = ListMovie?.MovieActors?.map(actorRelation => actorRelation.Actor?.name).join(", ") || "No actors available";


  const producers = ListMovie?.MovieProducers?.map(producerRelation => producerRelation.Producer?.name).join(", ") || "No producers available";

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <div className="flex flex-col lg:flex-row space-x-6 mb-10">
        <div className="lg:w-1/3 mb-6 lg:mb-0">
          <img
            src={formatImage(ListMovie?.poster)} 
            alt={ListMovie?.name}
            className="w-full h-auto object-cover rounded-xl shadow-2xl"
          />
        </div>

       
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">{ListMovie?.name}</h1>
          <div className="flex items-center space-x-4 my-4">
            <p className="text-sm text-[var(--text-secondary)] mb-2"><strong>Genres:</strong> {genres}</p>
          </div>
         
          <p className="text-sm text-[var(--text-secondary)] mb-2"><strong>Director:</strong> {directorName}</p>
          <p className="text-sm text-[var(--text-secondary)] mb-2"><strong>Actors:</strong> {actors}</p>
          <p className="text-sm text-[var(--text-secondary)] mb-2"><strong>Producers:</strong> {producers}</p>
          <p className="text-sm text-[var(--text-secondary)] mb-4"><strong>Duration:</strong> {ListMovie?.duration} minutes</p>
          <p className="text-sm text-[var(--text-secondary)] mb-4"><strong>Age Rating:</strong> {ListMovie?.age_rating == 0 ? "All ages" : `Age ${ListMovie?.age_rating}+ only`}</p>
          <p className="text-sm text-[var(--text-secondary)] mb-4"><strong>Production Year:</strong> {ListMovie?.year}</p>

         
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Watch Trailer</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-full mb-6"
            >
              Watch Trailer
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-gray-50 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Movie Description</h2>
        <p className="text-sm text-[var(--text-secondary)]">{ListMovie?.description}</p>
      </div>

      {isModalOpen && trailerId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-[9999]">
          <div className="relative bg-white p-6 rounded-lg w-full lg:w-2/3">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-0 right-0 p-2 text-2xl text-[var(--text-secondary)]"
            >
              ×
            </button>
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${trailerId}`} 
              title="Movie Trailer"
              className="rounded-lg shadow-lg"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
