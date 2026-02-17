import React from "react";

const ExamView = () => {
    return (
        <div className='container-fluid mt-5'>
            <div className='row border'>
                <div className='col-8 border'>
                    <div className='subjects border d-flex'>
                        <div className='subject bg-light-subtle border'>
                            <p>Biology</p>
                        </div>
                        <div className='subject bg-light-subtle border'>
                            <p>Maths</p>
                        </div>
                    </div>
                </div>
                <div className='col-4 border'>
                    <div className='student'>
                        <p>John doe</p>
                        <p>subject timer</p>
                        <p>exam timer</p>
                    </div>
                </div>
            </div>
            <div className='row border'>
                <div className='col-8'>
                    <div className='question mt-2'>
                        {/* question with option */}
                        Q. Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, dicta.
                    </div>
                    <div className='options mt-3'>
                        <div className='option'>
                            <label htmlFor=''>
                                <input type='radio' name='option' /> Lorem, ipsum.
                            </label>
                        </div>
                        <div className='option'>
                            <label htmlFor=''>
                                <input type='radio' name='option' /> Lorem, ipsum.
                            </label>
                        </div>
                        <div className='option'>
                            <label htmlFor=''>
                                <input type='radio' name='option' /> Lorem, ipsum.
                            </label>
                        </div>
                        <div className='option'>
                            <label htmlFor=''>
                                <input type='radio' name='option' /> Lorem, ipsum.
                            </label>
                        </div>
                    </div>

                    <div className="save-response d-flex justify-content-between mt-3 mb-2">
                        <div className="mark-review">
                            <button className="btn btn-primary mx-2"> Mark for review & Save</button>
                            <button className="btn btn-primary">clear response</button>
                        </div>
                        <div className="save">
                            <button className="btn btn-primary">Save & next</button>
                        </div>
                    </div>
                </div>
                <div className='col-4 border p-3'>
                    <div className='question-pallet'>
                        <p className='text-center'>Question pallet</p>
                        <div className='row g-4 justify-content-center text-center'>
                            <div className='pal-btn col-4'>
                                <button className='btn btn-primary col-4'>1</button>
                            </div>
                            <div className='pal-btn col-4'>
                                <button className='btn btn-primary col-4'>1</button>
                            </div>
                            <div className='pal-btn col-4'>
                                <button className='btn btn-primary col-4'>1</button>
                            </div>
                            <div className='pal-btn col-4'>
                                <button className='btn btn-primary col-4'>1</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamView;
