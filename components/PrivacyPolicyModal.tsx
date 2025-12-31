import React from 'react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-3xl font-bold mb-6 text-sky-400">Privacy Policy</h2>
        <div className="space-y-4 text-slate-300 text-sm md:text-base">
          <p>Last updated: October 2023</p>
          <p>At TinkerHub, accessible from tinkerhubapp.pages.dev, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by TinkerHub and how we use it.</p>
          
          <h3 className="text-xl font-bold text-white mt-6">Log Files</h3>
          <p>TinkerHub follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>

          <h3 className="text-xl font-bold text-white mt-6">Cookies and Web Beacons</h3>
          <p>Like any other website, TinkerHub uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

          <h3 className="text-xl font-bold text-white mt-6">Google DoubleClick DART Cookie</h3>
          <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-sky-400 hover:underline" target="_blank">https://policies.google.com/technologies/ads</a></p>

          <h3 className="text-xl font-bold text-white mt-6">Third Party Privacy Policies</h3>
          <p>TinkerHub's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>

          <h3 className="text-xl font-bold text-white mt-6">Children's Information</h3>
          <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. TinkerHub does not knowingly collect any Personal Identifiable Information from children under the age of 13.</p>

          <h3 className="text-xl font-bold text-white mt-6">Consent</h3>
          <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Close</button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;