import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-[80px] min-h-[calc(100vh-60px)]">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
