import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6 lg:px-8 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="mx-auto mb-3 w-full max-w-4xl">
          <svg
            width="868"
            height="47"
            viewBox="0 0 868 47"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-auto w-full"
          >
            <path d="M35.072 46.848C30.0373 46.848 25.3867 46.3147 21.12 45.248C16.8533 44.1813 13.1413 42.6453 9.984 40.64C6.82667 38.6347 4.37333 36.224 2.624 33.408C0.874665 30.5493 -1.43051e-06 27.3493 -1.43051e-06 23.808V23.04C-1.43051e-06 18.304 1.62133 14.208 4.864 10.752C8.10667 7.296 12.6933 4.65067 18.624 2.816C24.5973 0.938666 31.5947 0 39.616 0C49.3013 0 57.4933 1.216 64.192 3.648C70.8907 6.03733 75.9253 9.408 79.296 13.76L59.392 19.648C57.6853 17.856 55.1893 16.4907 51.904 15.552C48.6613 14.5707 44.5653 14.08 39.616 14.08C33.3867 14.08 28.48 14.8907 24.896 16.512C21.312 18.0907 19.52 20.2667 19.52 23.04V23.808C19.52 26.5813 21.312 28.7787 24.896 30.4C28.48 31.9787 33.3867 32.768 39.616 32.768C42.0907 32.768 44.6507 32.64 47.296 32.384C49.9413 32.0853 52.4373 31.68 54.784 31.168C57.1307 30.6133 59.072 29.952 60.608 29.184H39.424V21.504H79.296V45.824H63.936L64.576 36.224H63.36C61.9093 38.4427 59.7973 40.3413 57.024 41.92C54.2507 43.4987 50.9867 44.7147 47.232 45.568C43.52 46.4213 39.4667 46.848 35.072 46.848ZM85.548 45.824V1.024H164.908V13.952H105.388V17.92H157.996V28.928H105.388V32.896H164.908V45.824H85.548ZM198.118 45.824V15.872H168.358V1.024H247.719V15.872H217.958V45.824H198.118ZM269.15 45.824V30.976H298.91V15.872H269.15V1.024H348.511V15.872H318.75V30.976H348.511V45.824H269.15ZM354.985 45.824V1.024H374.569L414.506 25.728V1.024H434.346V45.824H414.762L374.826 21.12V45.824H354.985Z" fill="#323232" />
            <path d="M486.556 45.824V15.872H456.796V1.024H536.156V15.872H506.396V45.824H486.556ZM576.868 46.848C568.761 46.848 561.721 45.9307 555.747 44.096C549.817 42.2187 545.23 39.552 541.987 36.096C538.787 32.64 537.187 28.544 537.187 23.808V23.04C537.187 18.2613 538.787 14.1653 541.987 10.752C545.23 7.296 549.817 4.65067 555.747 2.816C561.721 0.938666 568.761 0 576.868 0C585.017 0 592.057 0.938666 597.988 2.816C603.918 4.65067 608.484 7.296 611.684 10.752C614.926 14.1653 616.548 18.2613 616.548 23.04V23.808C616.548 28.544 614.926 32.64 611.684 36.096C608.484 39.552 603.918 42.2187 597.988 44.096C592.057 45.9307 585.017 46.848 576.868 46.848ZM576.868 32.128C582.713 32.128 587.321 31.4027 590.692 29.952C594.105 28.4587 595.812 26.4107 595.812 23.808V23.04C595.812 20.4373 594.105 18.4107 590.692 16.96C587.321 15.4667 582.713 14.72 576.868 14.72C571.065 14.72 566.457 15.4667 563.043 16.96C559.63 18.4107 557.924 20.4373 557.924 23.04V23.808C557.924 26.4107 559.63 28.4587 563.043 29.952C566.457 31.4027 571.065 32.128 576.868 32.128ZM660.771 46.848C634.318 46.848 621.091 38.336 621.091 21.312V1.024H640.931V20.672C640.931 28.3093 647.544 32.128 660.771 32.128C673.998 32.128 680.611 28.3093 680.611 20.672V1.024H700.451V21.312C700.451 38.336 687.224 46.848 660.771 46.848ZM744.616 46.848C736.595 46.848 729.597 45.9093 723.624 44.032C717.693 42.1547 713.107 39.5093 709.864 36.096C706.621 32.64 705 28.544 705 23.808V23.04C705 18.304 706.621 14.2293 709.864 10.816C713.107 7.36 717.693 4.69333 723.624 2.816C729.597 0.938666 736.595 0 744.616 0C754.301 0 762.493 1.38667 769.192 4.16C775.891 6.89067 780.925 10.7307 784.296 15.68L764.392 21.568C762.685 19.3493 760.189 17.664 756.904 16.512C753.661 15.3173 749.565 14.72 744.616 14.72C740.861 14.72 737.555 15.0613 734.696 15.744C731.88 16.4267 729.683 17.3867 728.104 18.624C726.525 19.8613 725.736 21.3333 725.736 23.04V23.808C725.736 25.5147 726.525 27.008 728.104 28.288C729.683 29.5253 731.88 30.4853 734.696 31.168C737.555 31.808 740.861 32.128 744.616 32.128C749.565 32.128 753.661 31.552 756.904 30.4C760.189 29.2053 762.685 27.4987 764.392 25.28L784.296 31.168C780.925 36.1173 775.891 39.9787 769.192 42.752C762.493 45.4827 754.301 46.848 744.616 46.848ZM788.11 45.824V1.024H807.951V15.68H847.631V1.024H867.471V45.824H847.631V29.888H807.951V45.824H788.11Z" fill="#0088FF" />
          </svg>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions or feedback? We're here to help and would love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 ">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h3>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiMail className="text-blue-600 text-xl" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Us</h4>
                <p className="text-gray-600">support@teamVoyager.com</p>
                <p className="text-gray-600">info@travelapp.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiPhone className="text-blue-600 text-xl" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Call Us</h4>
                <p className="text-gray-600">+91 8292 98 6414</p>
                <p className="text-gray-600">Mon-Fri: 9am-6pm</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiMapPin className="text-blue-600 text-xl" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Visit Us</h4>
                <p className="text-gray-600">Kolkata</p>
                <p className="text-gray-600">West Benagal</p>
              </div>
            </div>
          </div>

          
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
          
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                Your Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows="5"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              ></textarea>
            </div>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition shadow-md ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <FiSend /> Send Message
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;